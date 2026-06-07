import { BadRequestException } from '@nestjs/common';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { CategoriesService } from './categories.service';

const mockExtended = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  softDelete: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
};

const mockCategory = {
  id: 'category-id-1',
  name: 'Electronics',
  slug: 'electronics',
  description: null,
  imageUrl: null,
  parentID: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

describe('CategoriesService', () => {
  let service: CategoriesService;
  let paginationUtilService: PaginationUtilService;
  let excelUtilService: ExcelUtilService;
  let generateExcelSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [CategoriesService],
    });

    service = module.get<CategoriesService>(CategoriesService);
    paginationUtilService = module.get<PaginationUtilService>(PaginationUtilService);
    excelUtilService = module.get<ExcelUtilService>(ExcelUtilService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest.spyOn(paginationUtilService, 'paging').mockReturnValue({
      skip: 0,
      format: jest.fn().mockReturnValue({ list: [], totalPages: 0, totalItems: 0 }),
    } as any);
    generateExcelSpy = jest
      .spyOn(excelUtilService, 'generateExcel')
      .mockReturnValue('workbook' as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCategory', () => {
    it('should return category by id', async () => {
      mockExtended.findUnique.mockResolvedValue(mockCategory);
      const result = await service.getCategory({ id: 'category-id-1' });
      expect(result).toEqual(mockCategory);
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'category-id-1' } });
    });

    it('should return null if not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getCategory({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return paginated categories', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockCategory]);
      const result = await service.getCategories({ page: 1, itemPerPage: 10 });
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalItems');
    });
  });

  describe('createCategory', () => {
    it('should create category', async () => {
      mockExtended.create.mockResolvedValue(mockCategory);
      const dto = { name: 'Electronics' };
      const result = await service.createCategory(dto, mockUser);
      expect(result).toEqual(mockCategory);
      expect(mockExtended.create).toHaveBeenCalledWith({
        data: { ...dto, user: mockUser },
      });
    });

    it('should throw if prisma throws', async () => {
      mockExtended.create.mockRejectedValue(new Error('DB error'));
      await expect(service.createCategory({ name: 'Electronics' }, mockUser)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      const updated = { ...mockCategory, name: 'Updated Electronics' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateCategory({
        where: { id: 'category-id-1' },
        data: { name: 'Updated Electronics' },
      });
      expect(result.name).toBe('Updated Electronics');
    });
  });

  describe('deleteCategory', () => {
    it('should soft delete category', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deleteCategory({ id: 'category-id-1' });
      expect(result).toEqual({ count: 1 });
      expect(mockExtended.softDelete).toHaveBeenCalledWith({ id: 'category-id-1' });
    });
  });

  describe('importCategories', () => {
    it('should import categories with parentID resolved', async () => {
      jest.spyOn(excelUtilService, 'read').mockResolvedValue({
        Category: [{ name: 'Phones', parentName: 'Electronics' }],
      });
      mockExtended.findMany.mockResolvedValue([{ id: 'category-id-1', name: 'Electronics' }]);
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importCategories({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should import categories without parent', async () => {
      jest.spyOn(excelUtilService, 'read').mockResolvedValue({
        Category: [{ name: 'Electronics', parentName: null }],
      });
      mockExtended.findMany.mockResolvedValue([]);
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importCategories({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should throw if parent category not found', async () => {
      jest.spyOn(excelUtilService, 'read').mockResolvedValue({
        Category: [{ name: 'Phones', parentName: 'NotExist' }],
      });
      mockExtended.findMany.mockResolvedValue([]);

      await expect(
        service.importCategories({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportCategories', () => {
    it('should generate excel with category data', async () => {
      mockExtended.export.mockResolvedValue([mockCategory]);
      mockExtended.findMany.mockResolvedValue([{ id: 'category-id-1', name: 'Electronics' }]);

      const result = await service.exportCategories({ ids: ['category-id-1'] });

      expect(result).toBe('workbook');
      expect(generateExcelSpy).toHaveBeenCalled();
    });
  });
});
