import { NotFoundException } from '@nestjs/common';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CartsService } from '../carts/carts.service';
import { CartItemsService } from './cart-items.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartItemsService', () => {
  let service: CartItemsService;
  let cartsService: CartsService;
  let getOrCreateCartSpy: jest.SpyInstance;

  const mockExtended = {
    update: jest.fn(),
  };

  const mockClient = {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [CartItemsService],
    });

    service = moduleRef.get(CartItemsService);
    cartsService = moduleRef.get(CartsService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest.spyOn(service, 'client', 'get').mockReturnValue(mockClient as any);

    getOrCreateCartSpy = jest.spyOn(cartsService, 'getOrCreateCart');
  });

  describe('createCartItem', () => {
    const params = {
      userID: 'user-1',
      productVariantID: 'variant-1',
      quantity: 2,
    };

    it('should get or create cart then upsert cart item with increment', async () => {
      const mockCart = { id: 'cart-1', userID: 'user-1' };
      const mockCartItem = {
        id: 'item-1',
        cartID: 'cart-1',
        productVariantID: 'variant-1',
        quantity: 2,
      };

      getOrCreateCartSpy.mockResolvedValue(mockCart);
      mockClient.upsert.mockResolvedValue(mockCartItem);

      const result = await service.createCartItem(params);

      expect(getOrCreateCartSpy).toHaveBeenCalledWith('user-1');
      expect(mockClient.upsert).toHaveBeenCalledWith({
        where: { cartID_productVariantID: { cartID: 'cart-1', productVariantID: 'variant-1' } },
        create: { cartID: 'cart-1', productVariantID: 'variant-1', quantity: 2 },
        update: { quantity: { increment: 2 } },
      });
      expect(result).toEqual(mockCartItem);
    });

    it('should create a new cart if user does not have one', async () => {
      const newCart = { id: 'cart-new', userID: 'user-1' };
      getOrCreateCartSpy.mockResolvedValue(newCart);
      mockClient.upsert.mockResolvedValue({ id: 'item-1', cartID: 'cart-new', quantity: 2 });

      await service.createCartItem(params);

      expect(mockClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ cartID: 'cart-new' }) }),
      );
    });
  });

  describe('updateCartItem', () => {
    const updateDto: UpdateCartItemDto = { quantity: 5 };

    it('should update quantity when item belongs to user', async () => {
      mockClient.findUnique.mockResolvedValue({
        id: 'item-1',
        cart: { userID: 'user-1' },
      });
      mockExtended.update.mockResolvedValue({ id: 'item-1', quantity: 5 });

      const result = await service.updateCartItem({
        where: { id: 'item-1' },
        data: updateDto,
        userID: 'user-1',
      });

      expect(mockClient.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        include: { cart: true },
      });
      expect(mockExtended.update).toHaveBeenCalledWith({
        data: updateDto,
        where: { id: 'item-1' },
      });
      expect(result).toEqual({ id: 'item-1', quantity: 5 });
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockClient.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCartItem({ where: { id: 'item-1' }, data: updateDto, userID: 'user-1' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockExtended.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when item belongs to another user', async () => {
      mockClient.findUnique.mockResolvedValue({
        id: 'item-1',
        cart: { userID: 'user-2' }, // khác user đang gọi
      });

      await expect(
        service.updateCartItem({ where: { id: 'item-1' }, data: updateDto, userID: 'user-1' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockExtended.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCartItem', () => {
    it('should delete item when it belongs to user', async () => {
      mockClient.findUnique.mockResolvedValue({
        id: 'item-1',
        cart: { userID: 'user-1' },
      });
      mockClient.delete.mockResolvedValue({ id: 'item-1' });

      const result = await service.deleteCartItem({ id: 'item-1' }, 'user-1');

      expect(mockClient.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        include: { cart: true },
      });
      expect(mockClient.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
      expect(result).toEqual({ id: 'item-1' });
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockClient.findUnique.mockResolvedValue(null);

      await expect(service.deleteCartItem({ id: 'item-1' }, 'user-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockClient.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when item belongs to another user', async () => {
      mockClient.findUnique.mockResolvedValue({
        id: 'item-1',
        cart: { userID: 'user-2' }, // khác user đang gọi
      });

      await expect(service.deleteCartItem({ id: 'item-1' }, 'user-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockClient.delete).not.toHaveBeenCalled();
    });
  });
});
