import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CreateOrderPromotionDto } from './dto/create-order-promotion.dto';
import { OrderPromotionsService } from './order-promotions.service';

describe('OrderPromotionsService', () => {
  let service: OrderPromotionsService;

  const mockExtended = {
    findMany: jest.fn(),
  };

  const mockTx = {
    orderPromotion: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [OrderPromotionsService],
    });

    service = moduleRef.get(OrderPromotionsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  describe('createOrderPromotion', () => {
    it('should call tx.orderPromotion.create with correct data', async () => {
      const dto: CreateOrderPromotionDto = {
        orderID: 'order-1',
        promotionID: 'promo-1',
        discountAmount: 10000,
      };
      const mockCreated = { id: 'op-1', ...dto };
      mockTx.orderPromotion.create.mockResolvedValue(mockCreated);

      const result = await service.createOrderPromotion(dto, mockTx as any);

      expect(mockTx.orderPromotion.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getOrderPromotions', () => {
    it('should call findMany without filter when no params provided', async () => {
      const mockData = [{ id: 'op-1', orderID: 'order-1', promotionID: 'promo-1' }];
      mockExtended.findMany.mockResolvedValue(mockData);

      const result = await service.getOrderPromotions({});

      expect(mockExtended.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          promotion: { select: { id: true, name: true, code: true, type: true, scope: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should filter by orderID when provided', async () => {
      mockExtended.findMany.mockResolvedValue([]);

      await service.getOrderPromotions({ orderID: 'order-1' });

      expect(mockExtended.findMany).toHaveBeenCalledWith({
        where: { orderID: 'order-1' },
        include: expect.any(Object),
      });
    });

    it('should filter by promotionID when provided', async () => {
      mockExtended.findMany.mockResolvedValue([]);

      await service.getOrderPromotions({ promotionID: 'promo-1' });

      expect(mockExtended.findMany).toHaveBeenCalledWith({
        where: { promotionID: 'promo-1' },
        include: expect.any(Object),
      });
    });
  });
});
