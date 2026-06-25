import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let service: CartsService;

  const mockExtended = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };

  const mockDeleteMany = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [CartsService],
    });

    service = moduleRef.get(CartsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    // prismaService là field thường, truy cập trực tiếp qua bracket notation
    service['prismaService'].cartItem = { deleteMany: mockDeleteMany } as any;
  });

  describe('getCart', () => {
    it('should call findUnique with correct userID and include cartItems', async () => {
      const mockCart = { id: 'cart-1', userID: 'user-1', cartItems: [] };
      mockExtended.findUnique.mockResolvedValue(mockCart);

      const result = await service.getCart('user-1');

      expect(mockExtended.findUnique).toHaveBeenCalledWith({
        where: { userID: 'user-1' },
        include: {
          cartItems: {
            include: {
              productVariant: {
                include: { product: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockCart);
    });

    it('should return null when cart does not exist', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      const result = await service.getCart('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getOrCreateCart', () => {
    it('should call upsert with correct userID and return cart', async () => {
      const mockCart = { id: 'cart-1', userID: 'user-1' };
      mockExtended.upsert.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart('user-1');

      expect(mockExtended.upsert).toHaveBeenCalledWith({
        where: { userID: 'user-1' },
        create: { userID: 'user-1' },
        update: {},
      });
      expect(result).toEqual(mockCart);
    });
  });

  describe('clearCart', () => {
    it('should delete all cart items when cart exists', async () => {
      mockExtended.findUnique.mockResolvedValue({ id: 'cart-1', userID: 'user-1' });
      mockDeleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearCart('user-1');

      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { userID: 'user-1' } });
      expect(mockDeleteMany).toHaveBeenCalledWith({ where: { cartID: 'cart-1' } });
      expect(result).toEqual({ count: 3 });
    });

    it('should return null when cart does not exist', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      const result = await service.clearCart('user-1');

      expect(mockDeleteMany).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
