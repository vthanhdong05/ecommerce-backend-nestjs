import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { ProductsService } from '../products/products.service';
import { ProductVariantsService } from './product-variants.service';

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

const mockProductsClient = { findMany: jest.fn() };

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockVariant = {
  id: 'variant-id-1',
  productID: 'product-id-1',
  name: 'Size 40',
  sku: 'NAM-40',
  price: 100,
  stockQuantity: 10,
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

const mockProduct = {
  id: 'product-id-1',
  name: 'Nike Air Max',
};

describe('ProductVariantsService', () => {
  let service: ProductVariantsService;
  let paginationUtilService: PaginationUtilService;
  let excelUtilService: ExcelUtilService;
  let productsService: ProductsService;
  let generateExcelSpy: jest.SpyInstance;
  let readSpy: jest.SpyInstance;
  let verifyOwnershipSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [ProductVariantsService],
    });

    service = module.get<ProductVariantsService>(ProductVariantsService);
    paginationUtilService = module.get<PaginationUtilService>(PaginationUtilService);
    excelUtilService = module.get<ExcelUtilService>(ExcelUtilService);
    productsService = module.get<ProductsService>(ProductsService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    Object.defineProperty(productsService, 'client', {
      get: () => mockProductsClient,
      configurable: true,
    });

    jest.spyOn(service.prismaService, '$transaction').mockImplementation((cb: any) =>
      cb({
        productVariant: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          create: jest.fn().mockImplementation((args) => mockExtended.create(args)),
        },
      }),
    );

    verifyOwnershipSpy = jest
      .spyOn(productsService, 'verifyProductOwnership')
      .mockResolvedValue(mockProduct as any);

    jest.spyOn(paginationUtilService, 'paging').mockReturnValue({
      skip: 0,
      format: jest.fn().mockReturnValue({ list: [], totalPages: 0, totalItems: 0 }),
    } as any);

    generateExcelSpy = jest
      .spyOn(excelUtilService, 'generateExcel')
      .mockReturnValue('workbook' as any);
    readSpy = jest.spyOn(excelUtilService, 'read');
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProductVariant', () => {
    it('should return variant by id', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      const result = await service.getProductVariant({ id: 'variant-id-1' });
      expect(result).toEqual(mockVariant);
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      await service.getProductVariant({
        id: 'variant-id-1',
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });

    it('should return null if not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      const result = await service.getProductVariant({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getProductVariants', () => {
    it('should return paginated variants', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockVariant]);
      const result = await service.getProductVariants({ page: 1, itemPerPage: 10 });
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
    });

    it('should verify ownership when vendorID and productID provided', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockVariant]);
      await service.getProductVariants({
        page: 1,
        itemPerPage: 10,
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('createProductVariant', () => {
    it('should create variant', async () => {
      mockExtended.create.mockResolvedValue(mockVariant);
      const dto = { price: 100, productID: 'product-id-1' };
      const result = await service.createProductVariant(dto as any, mockUser);
      expect(result).toEqual(mockVariant);
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.create.mockResolvedValue(mockVariant);
      await service.createProductVariant(
        { price: 100, productID: 'product-id-1' } as any,
        mockUser,
        'vendor-id-1',
      );
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('updateProductVariant', () => {
    it('should update variant', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      mockExtended.update.mockResolvedValue({ ...mockVariant, name: 'Size 41' });
      const result = await service.updateProductVariant({
        where: { id: 'variant-id-1', productID: 'product-id-1' },
        data: { name: 'Size 41' },
      });
      expect(result.name).toBe('Size 41');
    });

    it('should throw if variant not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(
        service.updateProductVariant({
          where: { id: 'not-exist', productID: 'product-id-1' },
          data: { name: 'Size 41' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      mockExtended.update.mockResolvedValue(mockVariant);
      await service.updateProductVariant({
        where: { id: 'variant-id-1', productID: 'product-id-1', vendorID: 'vendor-id-1' },
        data: { name: 'Size 41' },
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('deleteProductVariant', () => {
    it('should soft delete variant', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deleteProductVariant({ id: 'variant-id-1' });
      expect(result).toEqual({ count: 1 });
    });

    it('should throw if variant not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(service.deleteProductVariant({ id: 'not-exist' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockVariant);
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      await service.deleteProductVariant({
        id: 'variant-id-1',
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('exportProductVariants', () => {
    it('should generate excel with variant data', async () => {
      mockExtended.export.mockResolvedValue([mockVariant]);
      mockProductsClient.findMany.mockResolvedValue([mockProduct]);
      const result = await service.exportProductVariants({ ids: ['variant-id-1'] });
      expect(result).toBe('workbook');
      expect(generateExcelSpy).toHaveBeenCalled();
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.export.mockResolvedValue([]);
      mockProductsClient.findMany.mockResolvedValue([]);
      await service.exportProductVariants({
        ids: [],
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('importProductVariants', () => {
    it('should import variants with productID from param', async () => {
      readSpy.mockResolvedValue({
        ProductVariant: [{ name: 'Size 40', price: 100, attributes: null }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importProductVariants({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
        productID: 'product-id-1',
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should import variants with productName lookup', async () => {
      readSpy.mockResolvedValue({
        ProductVariant: [
          { productName: 'Nike Air Max', name: 'Size 40', price: 100, attributes: null },
        ],
      });
      mockProductsClient.findMany.mockResolvedValue([mockProduct]);
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importProductVariants({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should throw if product not found in lookup', async () => {
      readSpy.mockResolvedValue({
        ProductVariant: [
          { productName: 'NotExist', name: 'Size 40', price: 100, attributes: null },
        ],
      });
      mockProductsClient.findMany.mockResolvedValue([]);

      await expect(
        service.importProductVariants({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify ownership when vendorID provided', async () => {
      readSpy.mockResolvedValue({
        ProductVariant: [{ name: 'Size 40', price: 100, attributes: null }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      await service.importProductVariants({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });

      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });
});
