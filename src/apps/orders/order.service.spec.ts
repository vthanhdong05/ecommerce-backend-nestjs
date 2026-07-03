import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus, PromotionScope } from '@prisma/client';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { OrderAddressesService } from '../order-addresses/order-addresses.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderPromotionsService } from '../order-promotions/order-promotions.service';
import { PromotionsService } from '../promotions/promotions.service';
import { SHIPPING_FEE_PER_VENDOR } from './const/shipping.const';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderItemsService: OrderItemsService;
  let orderAddressesService: OrderAddressesService;
  let orderPromotionsService: OrderPromotionsService;
  let promotionsService: PromotionsService;
  let stringUtilService: StringUtilService;
  let excelUtilService: ExcelUtilService;
  let paginationUtilService: PaginationUtilService;
  let eventEmitter: EventEmitter2;

  const mockExtended = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    export: jest.fn(),
  };

  const mockTx = {
    order: { create: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
    productVariant: { update: jest.fn() },
    orderItem: { deleteMany: jest.fn() },
    orderPromotion: { findFirst: jest.fn(), update: jest.fn() },
  };

  const mockUser = { userID: 'user-1', userEmail: 'user@example.com' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrdersService],
    });

    service = moduleRef.get(OrdersService);
    orderItemsService = moduleRef.get(OrderItemsService);
    orderAddressesService = moduleRef.get(OrderAddressesService);
    orderPromotionsService = moduleRef.get(OrderPromotionsService);
    promotionsService = moduleRef.get(PromotionsService);
    stringUtilService = moduleRef.get(StringUtilService);
    excelUtilService = moduleRef.get(ExcelUtilService);
    paginationUtilService = moduleRef.get(PaginationUtilService);
    eventEmitter = moduleRef.get(EventEmitter2);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest
      .spyOn(service['prismaService'], '$transaction')
      .mockImplementation((callback: any) => callback(mockTx));
    jest.spyOn(stringUtilService, 'random').mockReturnValue('ABC123');

    jest.spyOn(orderItemsService, 'createOrderItem');
    jest.spyOn(orderAddressesService, 'createOrderAddress');
    jest.spyOn(orderPromotionsService, 'createOrderPromotion');
    jest.spyOn(promotionsService, 'validateAndCalculateDiscount');
    jest.spyOn(eventEmitter, 'emit');
  });

  // ============================================
  // getOrder
  // ============================================
  describe('getOrder', () => {
    it('should return order when belongs to user', async () => {
      const mockOrder = { id: 'order-1', userID: 'user-1' };
      mockExtended.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getOrder({ id: 'order-1', userID: 'user-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', userID: 'user-1' },
        include: { orderItems: true, orderAddresses: true },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getOrder({ id: 'order-1', userID: 'user-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // getVendorOrder
  // ============================================
  describe('getVendorOrder', () => {
    it('should return order filtered by vendorID', async () => {
      const mockOrder = { id: 'order-1', orderItems: [{ vendorID: 'vendor-1' }] };
      mockExtended.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getVendorOrder({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', orderItems: { some: { vendorID: 'vendor-1' } } },
        include: { orderItems: { where: { vendorID: 'vendor-1' } } },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when vendor has no item in order', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getVendorOrder({ id: 'order-1', vendorID: 'vendor-2' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // getOrders
  // ============================================
  describe('getOrders', () => {
    it('should return formatted paginated list of orders for a user', async () => {
      const mockList = [{ id: 'order-1', userID: 'user-1' }];
      const mockPaging = {
        skip: 0,
        format: jest.fn().mockReturnValue({
          items: mockList,
          meta: { totalItems: 1, page: 1, itemPerPage: 10 },
        }),
      };

      mockExtended.count.mockResolvedValue(1);
      jest.spyOn(paginationUtilService, 'paging').mockReturnValue(mockPaging as any);
      mockExtended.findMany.mockResolvedValue(mockList);

      const result = await service.getOrders({ page: 1, itemPerPage: 10, userID: 'user-1' });

      expect(mockExtended.count).toHaveBeenCalledWith({ where: { userID: 'user-1' } });
      expect(paginationUtilService.paging).toHaveBeenCalledWith({
        page: 1,
        itemPerPage: 10,
        totalItems: 1,
      });
      expect(mockExtended.findMany).toHaveBeenCalledWith({
        where: { userID: 'user-1' },
        skip: 0,
        take: 10,
      });
      expect(mockPaging.format).toHaveBeenCalledWith(mockList);
      expect(result).toEqual({
        items: mockList,
        meta: { totalItems: 1, page: 1, itemPerPage: 10 },
      });
    });
  });

  // ============================================
  // getVendorOrders
  // ============================================
  describe('getVendorOrders', () => {
    it('should return formatted paginated list of orders containing items belonging to the vendor', async () => {
      const mockList = [{ id: 'order-1', orderItems: [{ vendorID: 'vendor-1' }] }];
      const mockPaging = {
        skip: 0,
        format: jest.fn().mockReturnValue({
          items: mockList,
          meta: { totalItems: 1, page: 1, itemPerPage: 10 },
        }),
      };

      mockExtended.count.mockResolvedValue(1);
      jest.spyOn(paginationUtilService, 'paging').mockReturnValue(mockPaging as any);
      mockExtended.findMany.mockResolvedValue(mockList);

      const result = await service.getVendorOrders({
        vendorID: 'vendor-1',
        page: 1,
        itemPerPage: 10,
      });

      expect(mockExtended.count).toHaveBeenCalledWith({
        where: { orderItems: { some: { vendorID: 'vendor-1' } } },
      });
      expect(paginationUtilService.paging).toHaveBeenCalledWith({
        page: 1,
        itemPerPage: 10,
        totalItems: 1,
      });
      expect(mockExtended.findMany).toHaveBeenCalledWith({
        where: { orderItems: { some: { vendorID: 'vendor-1' } } },
        skip: 0,
        take: 10,
        include: { orderItems: { where: { vendorID: 'vendor-1' } } },
      });
      expect(mockPaging.format).toHaveBeenCalledWith(mockList);
      expect(result).toEqual({
        items: mockList,
        meta: { totalItems: 1, page: 1, itemPerPage: 10 },
      });
    });
  });

  // ============================================
  // createOrder
  // ============================================
  describe('createOrder', () => {
    const baseNewOrder = { id: 'order-1', orderNumber: 'ORD-20260622-ABC123' };
    const baseUserProfile = {
      firstName: 'Nguyen',
      lastName: 'Van A',
      fullAddress: '123 Le Loi',
      city: 'HCMC',
      province: null,
      country: 'VN',
      phone: '0900000000',
    };

    beforeEach(() => {
      mockTx.order.create.mockResolvedValue(baseNewOrder);
      mockTx.user.findUnique.mockResolvedValue(baseUserProfile);
      mockTx.order.update.mockResolvedValue({ id: 'order-1' });
    });

    it('should calculate shipping fee as SHIPPING_FEE_PER_VENDOR for single vendor and custom shipping address', async () => {
      const mockOrderItem = {
        id: 'item-1',
        orderID: 'order-1',
        vendorID: 'vendor-1',
        productVariantID: 'variant-1',
        quantity: 1,
        totalPrice: 100000,
      };

      (orderItemsService.createOrderItem as jest.Mock).mockResolvedValue(mockOrderItem);
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 1 }],
        shippingAddress: {
          firstName: 'Tran',
          lastName: 'Van B',
          fullAddress: '456 Nguyen Trai',
          city: 'Hanoi',
          province: null,
          country: 'VN',
          phone: '0911111111',
        },
      };

      await service.createOrder(dto, mockUser);

      expect(mockTx.user.findUnique).not.toHaveBeenCalled();
      expect(orderAddressesService.createOrderAddress).toHaveBeenCalledWith(
        {
          orderID: 'order-1',
          type: 'shipping',
          firstName: 'Tran',
          lastName: 'Van B',
          fullAddress: '456 Nguyen Trai',
          city: 'Hanoi',
          province: null,
          country: 'VN',
          phone: '0911111111',
        },
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          subtotal: 100000,
          shippingAmount: SHIPPING_FEE_PER_VENDOR,
          discountAmount: 0,
          totalAmount: 130000,
        }),
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.created', {
        orderID: 'order-1',
        userID: 'user-1',
        vendorIDs: ['vendor-1'],
        productVariantIDs: ['variant-1'],
      });
    });

    it('should resolve address from user profile when shippingAddress is not provided', async () => {
      const mockOrderItem = {
        id: 'item-1',
        orderID: 'order-1',
        vendorID: 'vendor-1',
        productVariantID: 'variant-1',
        quantity: 1,
        totalPrice: 100000,
      };

      (orderItemsService.createOrderItem as jest.Mock).mockResolvedValue(mockOrderItem);
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 1 }],
      };

      await service.createOrder(dto, mockUser);

      expect(mockTx.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(orderAddressesService.createOrderAddress).toHaveBeenCalledWith(
        {
          orderID: 'order-1',
          type: 'shipping',
          firstName: 'Nguyen',
          lastName: 'Van A',
          fullAddress: '123 Le Loi',
          city: 'HCMC',
          province: null,
          country: 'VN',
          phone: '0900000000',
        },
        mockTx,
      );
    });

    it('should throw BadRequestException when user profile lacks fullAddress or phone', async () => {
      mockTx.user.findUnique.mockResolvedValue({
        ...baseUserProfile,
        fullAddress: null,
      });

      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 1 }],
      };

      await expect(service.createOrder(dto, mockUser)).rejects.toThrow(BadRequestException);
      await expect(service.createOrder(dto, mockUser)).rejects.toThrow(
        /provide a shipping address/i,
      );
    });

    it('should calculate shipping fee for multiple vendors (vendor count × 30,000)', async () => {
      const mockOrderItems = [
        {
          id: 'item-1',
          orderID: 'order-1',
          vendorID: 'vendor-1',
          productVariantID: 'variant-1',
          quantity: 1,
          totalPrice: 100000,
        },
        {
          id: 'item-2',
          orderID: 'order-1',
          vendorID: 'vendor-2',
          productVariantID: 'variant-2',
          quantity: 1,
          totalPrice: 200000,
        },
      ];

      (orderItemsService.createOrderItem as jest.Mock)
        .mockResolvedValueOnce(mockOrderItems[0])
        .mockResolvedValueOnce(mockOrderItems[1]);
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [
          { productVariantID: 'variant-1', quantity: 1 },
          { productVariantID: 'variant-2', quantity: 1 },
        ],
      };

      await service.createOrder(dto, mockUser);

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          subtotal: 300000,
          shippingAmount: 60000,
          totalAmount: 360000,
        }),
      });
    });

    it('should count unique vendors using Set (not double count same vendor)', async () => {
      const mockOrderItems = [
        {
          id: 'item-1',
          vendorID: 'vendor-1',
          productVariantID: 'v1',
          quantity: 1,
          totalPrice: 50000,
        },
        {
          id: 'item-2',
          vendorID: 'vendor-2',
          productVariantID: 'v2',
          quantity: 1,
          totalPrice: 100000,
        },
        {
          id: 'item-3',
          vendorID: 'vendor-1',
          productVariantID: 'v3',
          quantity: 1,
          totalPrice: 75000,
        },
      ];

      mockOrderItems.forEach((item) => {
        (orderItemsService.createOrderItem as jest.Mock).mockResolvedValueOnce(item);
      });
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [
          { productVariantID: 'v1', quantity: 1 },
          { productVariantID: 'v2', quantity: 1 },
          { productVariantID: 'v3', quantity: 1 },
        ],
      };

      await service.createOrder(dto, mockUser);

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          shippingAmount: 60000,
        }),
      });
    });

    it('should apply order promotion (scope: ORDER) and save it', async () => {
      const mockOrderItem = {
        id: 'item-1',
        vendorID: 'vendor-1',
        productVariantID: 'variant-1',
        quantity: 2,
        totalPrice: 100000,
      };

      (orderItemsService.createOrderItem as jest.Mock).mockResolvedValue(mockOrderItem);
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});
      (promotionsService.validateAndCalculateDiscount as jest.Mock).mockResolvedValue({
        promotionID: 'promo-order',
        discountAmount: 15000,
        scope: 'ORDER',
      });
      (orderPromotionsService.createOrderPromotion as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
        promotionCode: 'ORDER_CODE',
      };

      await service.createOrder(dto, mockUser);

      expect(promotionsService.validateAndCalculateDiscount).toHaveBeenCalledWith(
        'ORDER_CODE',
        100000,
        mockTx,
        2,
      );
      expect(orderPromotionsService.createOrderPromotion).toHaveBeenCalledWith(
        {
          orderID: 'order-1',
          promotionID: 'promo-order',
          discountAmount: 15000,
        },
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          subtotal: 100000,
          shippingAmount: 30000,
          discountAmount: 15000,
          totalAmount: 115000,
        }),
      });
    });

    it('should apply shipping promotion (scope: SHIPPING) and save it', async () => {
      const mockOrderItem = {
        id: 'item-1',
        vendorID: 'vendor-1',
        productVariantID: 'variant-1',
        quantity: 1,
        totalPrice: 100000,
      };

      (orderItemsService.createOrderItem as jest.Mock).mockResolvedValue(mockOrderItem);
      (orderAddressesService.createOrderAddress as jest.Mock).mockResolvedValue({});
      (promotionsService.validateAndCalculateDiscount as jest.Mock).mockResolvedValue({
        promotionID: 'promo-ship',
        discountAmount: 10000,
        scope: 'SHIPPING',
      });
      (orderPromotionsService.createOrderPromotion as jest.Mock).mockResolvedValue({});

      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 1 }],
        shippingPromotionCode: 'SHIP_CODE',
      };

      await service.createOrder(dto, mockUser);

      expect(promotionsService.validateAndCalculateDiscount).toHaveBeenCalledWith(
        'SHIP_CODE',
        30000,
        mockTx,
        1,
      );
      expect(orderPromotionsService.createOrderPromotion).toHaveBeenCalledWith(
        {
          orderID: 'order-1',
          promotionID: 'promo-ship',
          discountAmount: 10000,
        },
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          subtotal: 100000,
          shippingAmount: 30000,
          discountAmount: 10000,
          totalAmount: 120000,
        }),
      });
    });
  });

  // ============================================
  // updateOrder
  // ============================================
  describe('updateOrder', () => {
    it('should update order fields if order exists and belongs to the user', async () => {
      const mockOrder = { id: 'order-1', userID: 'user-1' };
      mockExtended.findFirst.mockResolvedValue(mockOrder);
      mockExtended.update.mockResolvedValue({ id: 'order-1', notes: 'Updated notes' });

      const result = await service.updateOrder({
        id: 'order-1',
        userID: 'user-1',
        data: { notes: 'Updated notes' },
      });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', userID: 'user-1' },
      });
      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { notes: 'Updated notes' },
      });
      expect(result).toEqual({ id: 'order-1', notes: 'Updated notes' });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOrder({
          id: 'order-1',
          userID: 'user-1',
          data: { notes: 'Updated notes' },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // updateVendorOrderStatus
  // ============================================
  describe('updateVendorOrderStatus', () => {
    it('should update status when transition is allowed', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', status: OrderStatus.confirmed });
      mockExtended.update.mockResolvedValue({ id: 'order-1', status: OrderStatus.processing });

      const result = await service.updateVendorOrderStatus({
        id: 'order-1',
        vendorID: 'vendor-1',
        status: OrderStatus.processing,
      });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.processing },
      });
      expect(result).toEqual({ id: 'order-1', status: OrderStatus.processing });
    });

    it('should set shippedAt when status is transitioned to shipped', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', status: OrderStatus.processing });
      mockExtended.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.shipped,
        shippedAt: expect.any(Date),
      });

      const result = await service.updateVendorOrderStatus({
        id: 'order-1',
        vendorID: 'vendor-1',
        status: OrderStatus.shipped,
      });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: OrderStatus.shipped,
          shippedAt: expect.any(Date),
        }),
      });
      expect(result).toHaveProperty('shippedAt');
    });

    it('should set deliveredAt when status is transitioned to delivered', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', status: OrderStatus.shipped });
      mockExtended.update.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.delivered,
        deliveredAt: expect.any(Date),
      });

      const result = await service.updateVendorOrderStatus({
        id: 'order-1',
        vendorID: 'vendor-1',
        status: OrderStatus.delivered,
      });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: OrderStatus.delivered,
          deliveredAt: expect.any(Date),
        }),
      });
      expect(result).toHaveProperty('deliveredAt');
    });

    it('should throw NotFoundException if order not found for vendor', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVendorOrderStatus({
          id: 'order-1',
          vendorID: 'vendor-1',
          status: OrderStatus.processing,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transition is not allowed', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', status: OrderStatus.pending });

      await expect(
        service.updateVendorOrderStatus({
          id: 'order-1',
          vendorID: 'vendor-1',
          status: OrderStatus.delivered,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // cancelOrder
  // ============================================
  describe('cancelOrder', () => {
    it('should cancel order and restock items when status is pending', async () => {
      mockExtended.findFirst.mockResolvedValue({
        id: 'order-1',
        userID: 'user-1',
        status: OrderStatus.pending,
        orderItems: [{ productVariantID: 'variant-1', quantity: 2 }],
      });
      mockTx.order.update.mockResolvedValue({ id: 'order-1', status: OrderStatus.cancelled });

      const result = await service.cancelOrder({ id: 'order-1', userID: 'user-1' });

      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { stockQuantity: { increment: 2 } },
      });
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.cancelled },
      });
      expect(result).toEqual({ id: 'order-1', status: OrderStatus.cancelled });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.cancelOrder({ id: 'order-1', userID: 'user-1' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when order status is not cancellable', async () => {
      mockExtended.findFirst.mockResolvedValue({
        id: 'order-1',
        userID: 'user-1',
        status: OrderStatus.shipped,
        orderItems: [],
      });

      await expect(service.cancelOrder({ id: 'order-1', userID: 'user-1' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ============================================
  // cancelOrderItemsByVendor
  // ============================================
  describe('cancelOrderItemsByVendor', () => {
    const baseOrder = {
      id: 'order-1',
      userID: 'user-1',
      status: OrderStatus.pending,
      subtotal: 300000, // 3 items: 100k + 100k + 100k
      shippingAmount: 60000, // 2 vendors × 30k
      discountAmount: 30000, // 10k order discount + 20k shipping discount
      totalAmount: 330000,
      orderItems: [
        {
          id: 'item-1',
          vendorID: 'vendor-1',
          productVariantID: 'v1',
          quantity: 1,
          totalPrice: 100000,
        },
        {
          id: 'item-2',
          vendorID: 'vendor-1',
          productVariantID: 'v2',
          quantity: 1,
          totalPrice: 100000,
        },
        {
          id: 'item-3',
          vendorID: 'vendor-2',
          productVariantID: 'v3',
          quantity: 1,
          totalPrice: 100000,
        },
      ],
    };

    beforeEach(() => {
      mockExtended.findFirst.mockResolvedValue({ ...baseOrder });
      mockTx.productVariant.update.mockResolvedValue({});
      mockTx.orderItem.deleteMany.mockResolvedValue({ count: 2 });
      mockTx.order.update.mockResolvedValue({});
      mockTx.orderPromotion.findFirst.mockResolvedValue({
        id: 'op-1',
        discountAmount: 20000,
        promotion: { scope: PromotionScope.SHIPPING },
      });
    });

    it('should recalculate shipping when vendor cancels items (vendor count changes)', async () => {
      await service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockTx.productVariant.update).toHaveBeenCalledTimes(2);
      expect(mockTx.productVariant.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'v1' },
        data: { stockQuantity: { increment: 1 } },
      });
      expect(mockTx.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderID: 'order-1', vendorID: 'vendor-1' },
      });
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          subtotal: 100000,
          shippingAmount: 30000,
        }),
      });
    });

    it('should cap shipping discount at new shipping amount', async () => {
      await service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockTx.orderPromotion.update).not.toHaveBeenCalled();
    });

    it('should reduce shipping discount when exceeds new shipping amount', async () => {
      mockTx.orderPromotion.findFirst.mockResolvedValue({
        id: 'op-1',
        discountAmount: 50000,
        promotion: { scope: PromotionScope.SHIPPING },
      });

      await service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockTx.orderPromotion.update).toHaveBeenCalledWith({
        where: { id: 'op-1' },
        data: { discountAmount: 30000 },
      });
    });

    it('should cancel entire order when all items are cancelled', async () => {
      const orderWithVendor1Only = {
        ...baseOrder,
        orderItems: baseOrder.orderItems.filter((i) => i.vendorID === 'vendor-1'),
      };
      mockExtended.findFirst.mockResolvedValueOnce(orderWithVendor1Only);

      await service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          status: OrderStatus.cancelled,
          totalAmount: 0,
          subtotal: 0,
        },
      });
    });

    it('should recalculate order discount proportionally', async () => {
      await service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          discountAmount: expect.any(Number),
        }),
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order status is not cancellable', async () => {
      mockExtended.findFirst.mockResolvedValue({
        ...baseOrder,
        status: OrderStatus.shipped,
      });

      await expect(
        service.cancelOrderItemsByVendor({ id: 'order-1', vendorID: 'vendor-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // exportOrders
  // ============================================
  describe('exportOrders', () => {
    it('should export orders and return the generated excel workbook', async () => {
      const mockOrders = [{ id: 'order-1', totalAmount: 130000 }];
      mockExtended.export.mockResolvedValue(mockOrders);
      jest.spyOn(excelUtilService, 'generateExcel').mockReturnValue('mock-workbook-buffer' as any);

      const result = await service.exportOrders({ ids: ['order-1'] });

      expect(mockExtended.export).toHaveBeenCalledWith({
        where: { id: { in: ['order-1'] } },
      });
      expect(excelUtilService.generateExcel).toHaveBeenCalledWith({
        worksheets: [{ sheetName: 'Order', data: mockOrders }],
      });
      expect(result).toBe('mock-workbook-buffer');
    });
  });
});
