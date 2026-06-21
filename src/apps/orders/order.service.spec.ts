import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { OrderAddressesService } from '../order-addresses/order-addresses.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderItemsService: OrderItemsService;
  let orderAddressesService: OrderAddressesService;
  let stringUtilService: StringUtilService;
  let createOrderItemSpy: jest.SpyInstance;
  let createOrderAddressSpy: jest.SpyInstance;

  const mockExtended = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    export: jest.fn(),
  };

  // mock cho Prisma.TransactionClient (tx)
  const mockTx = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    productVariant: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrdersService],
    });

    service = moduleRef.get(OrdersService);
    orderItemsService = moduleRef.get(OrderItemsService);
    orderAddressesService = moduleRef.get(OrderAddressesService);
    stringUtilService = moduleRef.get(StringUtilService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest
      .spyOn(service['prismaService'], '$transaction')
      .mockImplementation((callback: any) => callback(mockTx));
    jest.spyOn(stringUtilService, 'random').mockReturnValue('abc123');

    createOrderItemSpy = jest.spyOn(orderItemsService, 'createOrderItem');
    createOrderAddressSpy = jest.spyOn(orderAddressesService, 'createOrderAddress');

    jest.clearAllMocks();
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
    const dto: CreateOrderDto = {
      items: [{ productVariantID: 'variant-1', quantity: 2 }],
      notes: 'Please call before delivery',
    };

    const mockUser = { userID: 'user-1', userEmail: 'user@example.com' };

    it('should create order items, fallback to user profile address, and calculate total', async () => {
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
      const mockUpdatedOrder = { id: 'order-1', subtotal: 200, totalAmount: 200 };

      mockTx.order.create.mockResolvedValue(mockNewOrder);
      jest.spyOn(orderItemsService, 'createOrderItem').mockResolvedValue(mockOrderItem as any);
      mockTx.user.findUnique.mockResolvedValue(mockUserProfile);
      jest.spyOn(orderAddressesService, 'createOrderAddress').mockResolvedValue({} as any);
      mockTx.order.update.mockResolvedValue(mockUpdatedOrder);

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
      expect(createOrderAddressSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderID: 'order-1',
          type: 'shipping',
          fullAddress: '123 Le Loi',
          phone: '0900000000',
        }),
        mockTx,
      );
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { subtotal: 200, totalAmount: 200 },
      });
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should use the provided shippingAddress instead of the user profile', async () => {
      const dtoWithAddress: CreateOrderDto = {
        ...dto,
        shippingAddress: {
          firstName: 'Tran',
          fullAddress: '456 Nguyen Hue',
          phone: '0911111111',
        },
      };

      mockTx.order.create.mockResolvedValue({ id: 'order-1' });
      jest.spyOn(orderItemsService, 'createOrderItem').mockResolvedValue({
        vendorID: 'vendor-1',
        totalPrice: 100,
      } as any);
      jest.spyOn(orderAddressesService, 'createOrderAddress').mockResolvedValue({} as any);
      mockTx.order.update.mockResolvedValue({ id: 'order-1', subtotal: 100, totalAmount: 100 });

      await service.createOrder(dtoWithAddress, mockUser);

      expect(mockTx.user.findUnique).not.toHaveBeenCalled();
      expect(createOrderAddressSpy).toHaveBeenCalledWith(
        expect.objectContaining({ fullAddress: '456 Nguyen Hue', phone: '0911111111' }),
        mockTx,
      );
    });

    it('should throw BadRequestException when no shippingAddress is provided and user profile has no address', async () => {
      mockTx.order.create.mockResolvedValue({ id: 'order-1' });
      jest.spyOn(orderItemsService, 'createOrderItem').mockResolvedValue({
        vendorID: 'vendor-1',
        totalPrice: 100,
      } as any);
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
