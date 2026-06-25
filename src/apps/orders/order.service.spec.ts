import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { OrderAddressesService } from '../order-addresses/order-addresses.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderPromotionsService } from '../order-promotions/order-promotions.service';
import { PromotionsService } from '../promotions/promotions.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderItemsService: OrderItemsService;
  let orderAddressesService: OrderAddressesService;
  let orderPromotionsService: OrderPromotionsService;
  let promotionsService: PromotionsService;
  let stringUtilService: StringUtilService;
  let createOrderItemSpy: jest.SpyInstance;
  let createOrderAddressSpy: jest.SpyInstance;
  let createOrderPromotionSpy: jest.SpyInstance;
  let validateAndCalculateDiscountSpy: jest.SpyInstance;
  let eventEmitterSpy: jest.SpyInstance;

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

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest
      .spyOn(service['prismaService'], '$transaction')
      .mockImplementation((callback: any) => callback(mockTx));
    jest.spyOn(stringUtilService, 'random').mockReturnValue('abc123');

    createOrderItemSpy = jest.spyOn(orderItemsService, 'createOrderItem');
    createOrderAddressSpy = jest.spyOn(orderAddressesService, 'createOrderAddress');
    createOrderPromotionSpy = jest.spyOn(orderPromotionsService, 'createOrderPromotion');
    validateAndCalculateDiscountSpy = jest.spyOn(promotionsService, 'validateAndCalculateDiscount');
    eventEmitterSpy = jest.spyOn(service['eventEmitter'], 'emit');
  });

  describe('getOrder', () => {
    it('should return the order when it belongs to the user', async () => {
      const mockOrder = { id: 'order-1', userID: 'user-1' };
      mockExtended.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getOrder({ id: 'order-1', userID: 'user-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', userID: 'user-1' },
        include: { orderItems: true, orderAddresses: true },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when the order does not belong to the user', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getOrder({ id: 'order-1', userID: 'user-2' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVendorOrder', () => {
    it('should return the order filtered by vendorID', async () => {
      const mockOrder = { id: 'order-1', orderItems: [{ vendorID: 'vendor-1' }] };
      mockExtended.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getVendorOrder({ id: 'order-1', vendorID: 'vendor-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', orderItems: { some: { vendorID: 'vendor-1' } } },
        include: { orderItems: { where: { vendorID: 'vendor-1' } } },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when the vendor has no item in the order', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getVendorOrder({ id: 'order-1', vendorID: 'vendor-2' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createOrder', () => {
    const mockNewOrder = { id: 'order-1', orderNumber: 'ORD-20260622-ABC123' };
    const mockOrderItem = {
      id: 'item-1',
      orderID: 'order-1',
      vendorID: 'vendor-1',
      productVariantID: 'variant-1',
      quantity: 2,
      totalPrice: 200,
    };
    const mockUserProfile = {
      firstName: 'Nguyen',
      lastName: 'Van A',
      fullAddress: '123 Le Loi',
      city: 'HCMC',
      province: null,
      country: 'VN',
      phone: '0900000000',
    };

    beforeEach(() => {
      mockTx.order.create.mockResolvedValue(mockNewOrder);
      createOrderItemSpy.mockResolvedValue(mockOrderItem);
      mockTx.user.findUnique.mockResolvedValue(mockUserProfile);
      createOrderAddressSpy.mockResolvedValue({});
      mockTx.order.update.mockResolvedValue({ id: 'order-1', subtotal: 200, totalAmount: 200 });
    });

    it('should create order without promotion and calculate total correctly', async () => {
      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
        notes: 'Please call before delivery',
      };

      const result = await service.createOrder(dto, mockUser);

      expect(mockTx.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userID: 'user-1',
          status: OrderStatus.pending,
          subtotal: 0,
          totalAmount: 0,
          notes: 'Please call before delivery',
        }),
      });
      expect(createOrderItemSpy).toHaveBeenCalledWith(
        { orderID: 'order-1', productVariantID: 'variant-1', quantity: 2 },
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ subtotal: 200, discountAmount: 0 }),
      });
      expect(validateAndCalculateDiscountSpy).not.toHaveBeenCalled();
      expect(createOrderPromotionSpy).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(eventEmitterSpy).toHaveBeenCalledWith('order.created', {
        orderID: 'order-1',
        userID: 'user-1',
        vendorIDs: ['vendor-1'],
        productVariantIDs: ['variant-1'],
      });
    });

    it('should apply ORDER promotion and reduce totalAmount', async () => {
      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
        promotionCode: 'SAVE10',
      };

      validateAndCalculateDiscountSpy.mockResolvedValue({
        promotionID: 'promo-1',
        discountAmount: 20,
        scope: 'ORDER',
      });
      createOrderPromotionSpy.mockResolvedValue({});

      await service.createOrder(dto, mockUser);

      expect(validateAndCalculateDiscountSpy).toHaveBeenCalledWith('SAVE10', 200, mockTx);
      expect(createOrderPromotionSpy).toHaveBeenCalledWith(
        { orderID: 'order-1', promotionID: 'promo-1', discountAmount: 20 },
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ subtotal: 200, discountAmount: 20, totalAmount: 180 }),
      });
    });

    it('should apply SHIPPING promotion separately from ORDER promotion', async () => {
      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
        promotionCode: 'SAVE10',
        shippingPromotionCode: 'FREESHIP',
      };

      validateAndCalculateDiscountSpy
        .mockResolvedValueOnce({ promotionID: 'promo-1', discountAmount: 20, scope: 'ORDER' })
        .mockResolvedValueOnce({ promotionID: 'promo-2', discountAmount: 0, scope: 'SHIPPING' }); // shippingAmount = 0 hiện tại
      createOrderPromotionSpy.mockResolvedValue({});

      await service.createOrder(dto, mockUser);

      expect(validateAndCalculateDiscountSpy).toHaveBeenCalledTimes(2);
      expect(createOrderPromotionSpy).toHaveBeenCalledTimes(2);
    });

    it('should use the provided shippingAddress instead of user profile', async () => {
      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
        shippingAddress: { firstName: 'Tran', fullAddress: '456 Nguyen Hue', phone: '0911111111' },
      };

      await service.createOrder(dto, mockUser);

      expect(mockTx.user.findUnique).not.toHaveBeenCalled();
      expect(createOrderAddressSpy).toHaveBeenCalledWith(
        expect.objectContaining({ fullAddress: '456 Nguyen Hue', phone: '0911111111' }),
        mockTx,
      );
    });

    it('should throw BadRequestException when user profile has no address and no shippingAddress provided', async () => {
      const dto: CreateOrderDto = {
        items: [{ productVariantID: 'variant-1', quantity: 2 }],
      };
      mockTx.user.findUnique.mockResolvedValue({ fullAddress: null, phone: null });

      await expect(service.createOrder(dto, mockUser as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateOrder', () => {
    it('should update notes when the order belongs to the user', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', userID: 'user-1' });
      mockExtended.update.mockResolvedValue({ id: 'order-1', notes: 'updated' });

      const result = await service.updateOrder({
        id: 'order-1',
        userID: 'user-1',
        data: { notes: 'updated' },
      });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { notes: 'updated' },
      });
      expect(result).toEqual({ id: 'order-1', notes: 'updated' });
    });

    it('should throw NotFoundException when the order does not belong to the user', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOrder({ id: 'order-1', userID: 'user-2', data: {} as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVendorOrderStatus', () => {
    it('should update status when the transition is allowed', async () => {
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

    it('should throw BadRequestException when the transition is not allowed', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'order-1', status: OrderStatus.pending });

      await expect(
        service.updateVendorOrderStatus({
          id: 'order-1',
          vendorID: 'vendor-1',
          status: OrderStatus.delivered,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the order has no item from this vendor', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVendorOrderStatus({
          id: 'order-1',
          vendorID: 'vendor-2',
          status: OrderStatus.processing,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel the order and restock items when status is pending', async () => {
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

    it('should throw NotFoundException when the order does not belong to the user', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.cancelOrder({ id: 'order-1', userID: 'user-2' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
