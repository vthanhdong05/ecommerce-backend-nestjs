import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CreateOrderAddressDto } from './dto/create-order-address.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';
import { OrderAddressesService } from './order-addresses.service';

describe('OrderAddressesService', () => {
  let service: OrderAddressesService;

  // mock sẵn các method của Prisma model `orderAddress` mà Service gọi qua `this.extended`
  const mockExtended = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrderAddressesService],
    });

    service = moduleRef.get(OrderAddressesService);

    // Service dùng `this.extended` (getter) để gọi prisma — override getter để trả về mock thay vì PrismaClient thật
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    jest.clearAllMocks();
  });

  describe('getOrderAddress', () => {
    it('should call findUnique with correct where and return the result', async () => {
      const mockData = { id: 'addr-1', orderID: 'order-1', fullAddress: '123 Le Loi' };
      mockExtended.findUnique.mockResolvedValue(mockData);

      const result = await service.getOrderAddress({ id: 'addr-1' });

      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'addr-1' } });
      expect(result).toEqual(mockData);
    });

    it('should return null when no record is found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      const result = await service.getOrderAddress({ id: 'not-exist' });

      expect(result).toBeNull();
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
      mockExtended.create.mockResolvedValue(mockCreated);

      const result = await service.createOrderAddress(dto);

      expect(mockExtended.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateOrderAddress', () => {
    it('should call update with correct where/data and return the updated record', async () => {
      const updateDto: UpdateOrderAddressDto = {
        fullAddress: '456 Nguyen Hue',
      };
      const mockUpdated = { id: 'addr-1', orderID: 'order-1', fullAddress: '456 Nguyen Hue' };

      mockExtended.update.mockResolvedValue(mockUpdated);

      const result = await service.updateOrderAddress({
        where: { id: 'addr-1' },
        data: updateDto,
      });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
        data: updateDto,
      });
      expect(result).toEqual(mockUpdated);
    });
  });
});
