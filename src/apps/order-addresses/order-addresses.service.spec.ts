import { NotFoundException } from '@nestjs/common';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CreateOrderAddressDto } from './dto/create-order-address.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';
import { OrderAddressesService } from './order-addresses.service';

describe('OrderAddressesService', () => {
  let service: OrderAddressesService;

  // mock cho this.extended — dùng cho getOrderAddress, updateOrderAddress
  const mockExtended = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  };

  // mock cho tx (Prisma.TransactionClient) — dùng cho createOrderAddress, vì hàm này chạy trong transaction của OrdersService
  const mockTx = {
    orderAddress: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrderAddressesService],
    });

    service = moduleRef.get(OrderAddressesService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    jest.clearAllMocks();
  });

  describe('getOrderAddress', () => {
    it('should call findFirst with correct where and return the result', async () => {
      const mockData = { id: 'addr-1', orderID: 'order-1', fullAddress: '123 Le Loi' };
      mockExtended.findFirst.mockResolvedValue(mockData);

      const result = await service.getOrderAddress({ id: 'addr-1', userID: 'user-1' });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'addr-1', order: { userID: 'user-1' } },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException when no record is found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(service.getOrderAddress({ id: 'not-exist', userID: 'user-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createOrderAddress', () => {
    it('should call create with correct data and return the created record', async () => {
      const dto: CreateOrderAddressDto = {
        orderID: 'order-1',
        type: 'shipping',
        firstName: 'Nguyen',
        fullAddress: '123 Le Loi',
        phone: '0900000000',
      };

      const mockCreated = { id: 'addr-1', ...dto };
      mockTx.orderAddress.create.mockResolvedValue(mockCreated);

      const result = await service.createOrderAddress(dto, mockTx as any);

      expect(mockTx.orderAddress.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateOrderAddress', () => {
    it('should call update with correct where/data and return the updated record', async () => {
      const updateDto: UpdateOrderAddressDto = {
        fullAddress: '456 Nguyen Hue',
      };
      const mockExisting = { id: 'addr-1', orderID: 'order-1', fullAddress: '123 Le Loi' };
      const mockUpdated = { id: 'addr-1', orderID: 'order-1', fullAddress: '456 Nguyen Hue' };

      mockExtended.findFirst.mockResolvedValue(mockExisting);
      mockExtended.update.mockResolvedValue(mockUpdated);

      const result = await service.updateOrderAddress({
        where: { id: 'addr-1' },
        data: updateDto,
        userID: 'user-1',
      });

      expect(mockExtended.findFirst).toHaveBeenCalledWith({
        where: { id: 'addr-1', order: { userID: 'user-1' } },
      });
      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
        data: updateDto,
      });
      expect(result).toEqual(mockUpdated);
    });

    it('should throw NotFoundException if address not found to update', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOrderAddress({
          where: { id: 'not-exist' },
          data: { fullAddress: '456 Nguyen Hue' },
          userID: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
