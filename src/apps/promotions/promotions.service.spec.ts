import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PromotionScope, PromotionStatus, PromotionType } from '@prisma/client';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionsService } from './promotions.service';

describe('PromotionsService', () => {
  let service: PromotionsService;

  const mockExtended = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    export: jest.fn(),
  };

  const mockTx = {
    promotion: { findUnique: jest.fn() },
    orderPromotion: { count: jest.fn() },
  };

  const mockPromotion = {
    id: 'promo-1',
    code: 'SAVE10',
    name: '10% Off',
    type: PromotionType.percentage,
    scope: PromotionScope.ORDER,
    value: 10,
    status: PromotionStatus.active,
    startDate: new Date('2026-01-01'),
    endDate: null,
    usageLimit: null,
    orderPromotions: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await AutoMockingModule.createTestingModule({
      providers: [PromotionsService],
    });

    service = moduleRef.get(PromotionsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  describe('getPromotion', () => {
    it('should return the promotion when found', async () => {
      mockExtended.findUnique.mockResolvedValue(mockPromotion);

      const result = await service.getPromotion({ id: 'promo-1' });

      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'promo-1' } });
      expect(result).toEqual(mockPromotion);
    });

    it('should throw NotFoundException when not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      await expect(service.getPromotion({ id: 'not-exist' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPromotion', () => {
    it('should create a promotion with user context', async () => {
      const dto: CreatePromotionDto = {
        code: 'SAVE10',
        name: '10% Off',
        type: PromotionType.percentage,
        scope: PromotionScope.ORDER,
        value: 10,
        startDate: new Date('2026-01-01'),
      };

      const mockUser = { userID: 'user-1', userEmail: 'admin@example.com' };
      mockExtended.create.mockResolvedValue({ id: 'promo-1', ...dto });

      const result = await service.createPromotion(dto, mockUser);

      expect(mockExtended.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ code: 'SAVE10', user: mockUser }),
      });
      expect(result).toEqual({ id: 'promo-1', ...dto });
    });
  });

  describe('updatePromotion', () => {
    it('should update the promotion when found', async () => {
      const updateDto: UpdatePromotionDto = { name: 'Updated Name' };
      mockExtended.findUnique.mockResolvedValue(mockPromotion);
      mockExtended.update.mockResolvedValue({ ...mockPromotion, name: 'Updated Name' });

      const result = await service.updatePromotion({ where: { id: 'promo-1' }, data: updateDto });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'promo-1' },
        data: updateDto,
      });
      expect(result).toEqual({ ...mockPromotion, name: 'Updated Name' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePromotion({ where: { id: 'not-exist' }, data: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivatePromotion', () => {
    it('should set status to inactive', async () => {
      mockExtended.findUnique.mockResolvedValue(mockPromotion);
      mockExtended.update.mockResolvedValue({ ...mockPromotion, status: PromotionStatus.inactive });

      const result = await service.deactivatePromotion({ id: 'promo-1' });

      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'promo-1' },
        data: { status: PromotionStatus.inactive },
      });
      expect(result).toEqual({ ...mockPromotion, status: PromotionStatus.inactive });
    });

    it('should throw NotFoundException when not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      await expect(service.deactivatePromotion({ id: 'not-exist' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deletePromotion', () => {
    it('should soft delete when no OrderPromotion exists', async () => {
      mockExtended.findUnique.mockResolvedValue({ ...mockPromotion, orderPromotions: [] });
      mockExtended.softDelete.mockResolvedValue({ count: 1 });

      const result = await service.deletePromotion({ id: 'promo-1' });

      expect(mockExtended.softDelete).toHaveBeenCalledWith({ id: 'promo-1' });
      expect(result).toEqual({ count: 1 });
    });

    it('should throw BadRequestException when OrderPromotion exists', async () => {
      mockExtended.findUnique.mockResolvedValue({
        ...mockPromotion,
        orderPromotions: [{ id: 'op-1' }],
      });

      await expect(service.deletePromotion({ id: 'promo-1' })).rejects.toThrow(BadRequestException);
      expect(mockExtended.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);

      await expect(service.deletePromotion({ id: 'not-exist' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateAndCalculateDiscount', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should throw BadRequestException when promotion code does not exist', async () => {
      mockTx.promotion.findUnique.mockResolvedValue(null);

      await expect(
        service.validateAndCalculateDiscount('INVALID', 100000, mockTx as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when promotion is inactive', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        status: PromotionStatus.inactive,
      });

      await expect(
        service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when promotion has not started yet', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        startDate: new Date('2099-01-01'),
      });

      await expect(
        service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when promotion has expired', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        endDate: new Date('2020-01-01'),
      });

      await expect(
        service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when usage limit is reached', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({ ...mockPromotion, usageLimit: 10 });
      mockTx.orderPromotion.count.mockResolvedValue(10);

      await expect(
        service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate discount correctly for percentage type', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        type: PromotionType.percentage,
        scope: PromotionScope.ORDER,
        value: 10,
      });

      const result = await service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any);

      expect(result).toEqual({
        promotionID: 'promo-1',
        discountAmount: 10000, // 10% of 100000
        scope: PromotionScope.ORDER,
      });
    });

    it('should calculate discount correctly for fixed_amount type', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        type: PromotionType.fixed_amount,
        scope: PromotionScope.ORDER,
        value: 50000,
      });

      const result = await service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any);

      expect(result).toEqual({
        promotionID: 'promo-1',
        discountAmount: 50000,
        scope: PromotionScope.ORDER,
      });
    });

    it('should cap fixed_amount discount at subtotal to avoid negative total', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        type: PromotionType.fixed_amount,
        scope: PromotionScope.ORDER,
        value: 200000, // more than subtotal
      });

      const result = await service.validateAndCalculateDiscount('SAVE10', 100000, mockTx as any);

      expect(result.discountAmount).toBe(100000); // capped at subtotal
    });

    it('should calculate discount for SHIPPING scope', async () => {
      mockTx.promotion.findUnique.mockResolvedValue({
        ...mockPromotion,
        type: PromotionType.percentage,
        scope: PromotionScope.SHIPPING,
        value: 100, // free shipping
      });

      const result = await service.validateAndCalculateDiscount('FREESHIP', 100000, mockTx as any);

      expect(result).toEqual({
        promotionID: 'promo-1',
        discountAmount: 100000, // 100% of subtotal passed in (caller phải truyền shippingAmount cho đúng)
        scope: PromotionScope.SHIPPING,
      });
    });
  });
});
