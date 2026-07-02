import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { VendorsService } from '../vendors/vendors.service';
import { ProductsService } from './products.service';

const mockExtended = {
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  softDelete: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
};

const mockVendorsClient = { findMany: jest.fn() };

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockProduct = {
  id: 'product-id-1',
  vendorID: 'vendor-id-1',
  name: 'Nike Air Max',
  slug: 'nike-air-max',
  description: null,
  sku: 'NAM-001',
  price: 100,
  stockQuantity: 10,
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  productCategories: [],
};

const mockProductWithCategories = {
  ...mockProduct,
  productCategories: [
    {
      category: {
        name: 'Electronics',
      },
    },
  ],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let paginationUtilService: PaginationUtilService;
  let excelUtilService: ExcelUtilService;
  let vendorsService: VendorsService;
  let eventEmitter: EventEmitter2;
  let generateExcelSpy: jest.SpyInstance;
  let readSpy: jest.SpyInstance;
  let emitSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [ProductsService],
    });

    service = module.get<ProductsService>(ProductsService);
    paginationUtilService = module.get<PaginationUtilService>(PaginationUtilService);
    excelUtilService = module.get<ExcelUtilService>(ExcelUtilService);
    vendorsService = module.get<VendorsService>(VendorsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    // Dùng Object.defineProperty thay vì jest.spyOn cho getter client
    Object.defineProperty(vendorsService, 'client', {
      get: () => mockVendorsClient,
      configurable: true,
    });

    emitSpy = jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);
    jest.spyOn(paginationUtilService, 'paging').mockReturnValue({
      skip: 0,
      format: jest.fn().mockReturnValue({ list: [], totalPages: 0, totalItems: 0 }),
    } as any);

    generateExcelSpy = jest
      .spyOn(excelUtilService, 'generateExcel')
      .mockReturnValue('workbook' as any);
    readSpy = jest.spyOn(excelUtilService, 'read');

    jest
      .spyOn(service.prismaService.category, 'findMany')
      .mockResolvedValue([{ id: 'cat-id-1', name: 'Electronics' }]);

    jest.spyOn(service.prismaService, '$transaction').mockImplementation((cb: any) =>
      cb({
        product: {
          create: jest.fn().mockImplementation((args) => mockExtended.create(args)),
          update: jest.fn().mockImplementation((args) => mockExtended.update(args)),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          createManyAndReturn: jest.fn().mockImplementation((args) => {
            const dataList = Array.isArray(args.data) ? args.data : [args.data];
            return Promise.resolve(
              dataList.map((item: any, index: number) => ({
                id: `product-id-${index + 1}`,
                ...item,
              })),
            );
          }),
        },
        productVariant: {
          create: jest.fn().mockResolvedValue({ id: 'variant-id-1' }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        productCategory: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        productImage: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      }),
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProduct', () => {
    it('should return product by id', async () => {
      mockExtended.findFirst.mockResolvedValue(mockProduct);
      const result = await service.getProduct({ id: 'product-id-1' });
      const rest = { ...mockProduct } as any;
      delete rest.productCategories;
      expect(result).toEqual({ ...rest, categoryIDs: [] });
    });

    it('should filter by vendorID if provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockProduct);
      const result = await service.getProduct({ id: 'product-id-1', vendorID: 'vendor-id-1' });
      const rest = { ...mockProduct } as any;
      delete rest.productCategories;
      expect(result).toEqual({ ...rest, categoryIDs: [] });
      expect(mockExtended.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'product-id-1', vendorID: 'vendor-id-1' }),
        }),
      );
    });

    it('should return null if not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      const result = await service.getProduct({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockProduct]);
      const result = await service.getProducts({ page: 1, itemPerPage: 10 });
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
    });

    it('should filter by vendorID if provided', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockProduct]);
      await service.getProducts({ page: 1, itemPerPage: 10, vendorID: 'vendor-id-1' });
      expect(mockExtended.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { vendorID: 'vendor-id-1' } }),
      );
    });
  });

  describe('createProduct', () => {
    it('should create product and emit event', async () => {
      mockExtended.create.mockResolvedValue(mockProduct);
      const dto = { name: 'Nike Air Max', vendorID: 'vendor-id-1', price: 100, categoryIDs: [] };
      const result = await service.createProduct(dto, mockUser);
      expect(result).toEqual(mockProduct);
      expect(emitSpy).toHaveBeenCalledWith('product.created', {
        vendorID: mockProduct.vendorID,
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const updated = { ...mockProduct, name: 'Updated Product' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateProduct({
        where: { id: 'product-id-1' },
        data: { name: 'Updated Product' },
      });
      expect(result.name).toBe('Updated Product');
    });

    it('should throw if product not found for vendor', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(
        service.updateProduct({
          where: { id: 'product-id-1', vendorID: 'vendor-id-1' },
          data: { name: 'Updated' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update without vendorID check if not provided', async () => {
      const updated = { ...mockProduct, name: 'Updated' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateProduct({
        where: { id: 'product-id-1' },
        data: { name: 'Updated' },
      });
      expect(mockExtended.findFirst).not.toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product and emit event', async () => {
      mockExtended.findFirst.mockResolvedValue(mockProduct);
      mockExtended.softDelete.mockResolvedValue(mockProduct);
      const result = await service.deleteProduct({ id: 'product-id-1' });
      expect(result).toEqual({ count: 1 });
      expect(emitSpy).toHaveBeenCalledWith('product.deleted', {
        vendorID: mockProduct.vendorID,
      });
    });

    it('should throw if product not found for vendor', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteProduct({ id: 'product-id-1', vendorID: 'vendor-id-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportProducts', () => {
    it('should generate excel with product data', async () => {
      mockExtended.export.mockResolvedValue([mockProductWithCategories]);
      mockVendorsClient.findMany.mockResolvedValue([{ id: 'vendor-id-1', name: 'Nike' }]);

      const result = await service.exportProducts({ ids: ['product-id-1'] });

      expect(result).toBe('workbook');
      expect(generateExcelSpy).toHaveBeenCalled();
    });

    it('should filter by vendorID if provided', async () => {
      mockExtended.export.mockResolvedValue([mockProductWithCategories]);
      mockVendorsClient.findMany.mockResolvedValue([{ id: 'vendor-id-1', name: 'Nike' }]);

      await service.exportProducts({ ids: [], vendorID: 'vendor-id-1' });

      expect(mockExtended.export).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ vendorID: 'vendor-id-1' }) }),
      );
    });
  });

  describe('importProducts', () => {
    it('should import products for vendor directly', async () => {
      readSpy.mockResolvedValue({
        Product: [{ name: 'Nike Air', price: 100, categoryNames: 'Electronics' }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importProducts({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
        vendorID: 'vendor-id-1',
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should import products for admin with vendorName lookup', async () => {
      readSpy.mockResolvedValue({
        Product: [
          { name: 'Nike Air', price: 100, vendorName: 'Nike', categoryNames: 'Electronics' },
        ],
      });
      mockVendorsClient.findMany.mockResolvedValue([{ id: 'vendor-id-1', name: 'Nike' }]);
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importProducts({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should throw if vendor not found in admin import', async () => {
      readSpy.mockResolvedValue({
        Product: [
          { name: 'Nike Air', price: 100, vendorName: 'NotExist', categoryNames: 'Electronics' },
        ],
      });
      mockVendorsClient.findMany.mockResolvedValue([]);

      await expect(
        service.importProducts({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
