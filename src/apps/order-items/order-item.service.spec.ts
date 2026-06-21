import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { OrderItemsService } from './order-items.service';

describe('OrderItemsService', () => {
  let service: OrderItemsService;

  const mockExtended = {
    findFirst: jest.fn(), // đổi từ findUnique
  };

  // mock cho Prisma.TransactionClient (tx) truyền vào createOrderItem
  const mockTx = {
    productVariant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrderItemsService],
    });

    service = moduleRef.get(OrderItemsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    jest.clearAllMocks();
  });

  describe('getOrderItem', () => {
    it('should call findFirst with userID condition and return the result', async () => {
      const mockData = { id: 'item-1', orderID: 'order-1', quantity: 2 };
      mockExtended.findFirst.mockResolvedValue(mockData);

      const result = await service.getOrderItem({ id: 'item-1', userID: 'user-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'item-1', order: { userID: 'user-1' } },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException when no record is found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getOrderItem({ id: 'not-exist' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOrderItem', () => {
    const dto: CreateOrderItemDto = {
      orderID: 'order-1',
      productVariantID: 'variant-1',
      quantity: 2,
    };

    it('should throw NotFoundException when the product variant does not exist', async () => {
      mockTx.productVariant.findUnique.mockResolvedValue(null);

      await expect(service.createOrderItem(dto, mockTx as any)).rejects.toThrow(NotFoundException);
      expect(mockTx.orderItem.create).not.toHaveBeenCalled();
      expect(mockTx.productVariant.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      mockTx.productVariant.findUnique.mockResolvedValue({
        id: 'variant-1',
        name: 'Red - L',
        price: 100,
        stockQuantity: 1, // less than requested quantity (2)
        attributes: null,
        product: { id: 'product-1', name: 'T-Shirt', vendorID: 'vendor-1' },
      });

      await expect(service.createOrderItem(dto, mockTx as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTx.orderItem.create).not.toHaveBeenCalled();
      expect(mockTx.productVariant.update).not.toHaveBeenCalled();
    });

    it('should create the order item and decrement stock when stock is sufficient', async () => {
      const mockVariant = {
        id: 'variant-1',
        name: 'Red - L',
        sku: 'SKU-001',
        price: 100,
        stockQuantity: 5,
        attributes: { color: 'red' },
        product: { id: 'product-1', name: 'T-Shirt', vendorID: 'vendor-1' },
      };
      const mockCreatedOrderItem = { id: 'item-1', orderID: 'order-1', quantity: 2 };

      mockTx.productVariant.findUnique.mockResolvedValue(mockVariant);
      mockTx.orderItem.create.mockResolvedValue(mockCreatedOrderItem);
      mockTx.productVariant.update.mockResolvedValue({ ...mockVariant, stockQuantity: 3 });

      const result = await service.createOrderItem(dto, mockTx as any);

      expect(mockTx.orderItem.create).toHaveBeenCalledWith({
        data: {
          orderID: 'order-1',
          vendorID: 'vendor-1',
          productVariantID: 'variant-1',
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
          productVariantSnapshot: {
            productVariantID: 'variant-1',
            productID: 'product-1',
            productName: 'T-Shirt',
            variantName: 'Red - L',
            sku: 'SKU-001',
            price: '100',
            attributes: { color: 'red' },
          },
        },
      });
      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { stockQuantity: { decrement: 2 } },
      });
      expect(result).toEqual(mockCreatedOrderItem);
    });
  });
});
