import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { ProductsService } from '../products/products.service';
import { ProductImagesService } from './product-images.service';

const mockExtended = {
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
  upsert: jest.fn(),
};

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockImage = {
  id: 'image-id-1',
  name: 'nike-air',
  description: null,
  imageUrl: 'https://cloudinary.com/image.jpg',
  sortOrder: 0,
  productID: 'product-id-1',
  productVariantID: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

describe('ProductImagesService', () => {
  let service: ProductImagesService;
  let excelUtilService: ExcelUtilService;
  let fileUtilService: FileUtilService;
  let productsService: ProductsService;
  let eventEmitter: EventEmitter2;
  let verifyOwnershipSpy: jest.SpyInstance;
  let generateExcelSpy: jest.SpyInstance;
  let readSpy: jest.SpyInstance;
  let emitSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [ProductImagesService],
    });

    service = module.get<ProductImagesService>(ProductImagesService);
    excelUtilService = module.get<ExcelUtilService>(ExcelUtilService);
    fileUtilService = module.get<FileUtilService>(FileUtilService);
    productsService = module.get<ProductsService>(ProductsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    verifyOwnershipSpy = jest
      .spyOn(productsService, 'verifyProductOwnership')
      .mockResolvedValue({ id: 'product-id-1' } as any);

    generateExcelSpy = jest
      .spyOn(excelUtilService, 'generateExcel')
      .mockReturnValue('workbook' as any);

    readSpy = jest.spyOn(excelUtilService, 'read');
    emitSpy = jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProductImage', () => {
    it('should return image by id', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      const result = await service.getProductImage({ id: 'image-id-1' });
      expect(result).toEqual(mockImage);
    });

    it('should verify ownership when vendorID and productID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      await service.getProductImage({
        id: 'image-id-1',
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
      const result = await service.getProductImage({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getProductImages', () => {
    it('should return images', async () => {
      mockExtended.findMany.mockResolvedValue([mockImage]);
      const result = await service.getProductImages();
      expect(result).toEqual([mockImage]);
    });

    it('should verify ownership when vendorID and productID provided', async () => {
      mockExtended.findMany.mockResolvedValue([mockImage]);
      await service.getProductImages({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('createProductImage', () => {
    it('should create image', async () => {
      mockExtended.create.mockResolvedValue(mockImage);
      const dto = {
        name: 'nike-air',
        imageUrl: 'https://cloudinary.com/image.jpg',
        sortOrder: 0,
      };
      const result = await service.createProductImage(dto);
      expect(result).toEqual(mockImage);
    });

    it('should verify ownership when vendorID provided', async () => {
      mockExtended.create.mockResolvedValue(mockImage);
      await service.createProductImage(
        {
          name: 'nike-air',
          imageUrl: 'https://cloudinary.com/image.jpg',
          productID: 'product-id-1',
        } as any,
        'vendor-id-1',
      );
      expect(verifyOwnershipSpy).toHaveBeenCalledWith({
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });
    });
  });

  describe('verifyImageOwnership', () => {
    it('should return image if found', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      const result = await service.verifyImageOwnership({
        imageID: 'image-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(result).toEqual(mockImage);
    });

    it('should throw if image not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(
        service.verifyImageOwnership({
          imageID: 'not-exist',
          vendorID: 'vendor-id-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProductImage', () => {
    it('should update image', async () => {
      const updated = { ...mockImage, name: 'updated-image' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateProductImage({
        where: { id: 'image-id-1' },
        data: { name: 'updated-image' },
      });
      expect(result.name).toBe('updated-image');
    });

    it('should verify image ownership when vendorID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      mockExtended.update.mockResolvedValue(mockImage);
      await service.updateProductImage({
        where: { id: 'image-id-1', vendorID: 'vendor-id-1' },
        data: { name: 'updated' },
      });
      expect(mockExtended.findFirst).toHaveBeenCalled();
    });
  });

  describe('deleteProductImage', () => {
    it('should soft delete image', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deleteProductImage({ id: 'image-id-1' });
      expect(result).toEqual({ count: 1 });
    });

    it('should verify image ownership when vendorID provided', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      await service.deleteProductImage({
        id: 'image-id-1',
        vendorID: 'vendor-id-1',
      });
      expect(mockExtended.findFirst).toHaveBeenCalled();
    });
  });

  describe('exportProductImages', () => {
    it('should generate excel', async () => {
      mockExtended.export.mockResolvedValue([mockImage]);
      const result = await service.exportProductImages({ ids: ['image-id-1'] });
      expect(result).toBe('workbook');
      expect(generateExcelSpy).toHaveBeenCalled();
    });

    it('should verify ownership when vendorID and productID provided', async () => {
      mockExtended.export.mockResolvedValue([]);
      await service.exportProductImages({
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

  describe('importProductImages', () => {
    it('should import images', async () => {
      readSpy.mockResolvedValue({
        ProductImage: [{ name: 'nike-air', imageUrl: 'https://cloudinary.com/image.jpg' }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importProductImages({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should verify ownership when vendorID and productID provided', async () => {
      readSpy.mockResolvedValue({
        ProductImage: [{ name: 'nike-air', imageUrl: 'https://cloudinary.com/image.jpg' }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      await service.importProductImages({
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

  describe('uploadProductImages', () => {
    it('should emit event for each file', () => {
      const files = [
        { originalname: 'nike.jpg' },
        { originalname: 'air.jpg' },
      ] as Express.Multer.File[];

      const result = service.uploadProductImages({ files, user: mockUser });

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Upload received, processing in background' });
    });

    it('should emit with productID and vendorID', () => {
      const files = [{ originalname: 'nike.jpg' }] as Express.Multer.File[];

      service.uploadProductImages({
        files,
        user: mockUser,
        productID: 'product-id-1',
        vendorID: 'vendor-id-1',
      });

      expect(emitSpy).toHaveBeenCalledWith(
        'product-images.upload',
        expect.objectContaining({
          productID: 'product-id-1',
          vendorID: 'vendor-id-1',
        }),
      );
    });
  });

  describe('uploadProductImagesEvent', () => {
    it('should upload image and upsert to db', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      jest.spyOn(fileUtilService, 'removeFileExtension').mockReturnValue('nike-air');
      jest.spyOn(fileUtilService, 'uploadImage').mockResolvedValue({
        url: 'http://cloudinary.com/image.jpg',
        secure_url: 'https://cloudinary.com/image.jpg',
        display_name: 'nike-air',
        created_at: new Date().toISOString(),
      });
      mockExtended.upsert.mockResolvedValue(mockImage);

      const result = await service.uploadProductImagesEvent({
        file: { originalname: 'nike-air.jpg', path: 'uploads/nike-air.jpg' } as any,
        user: mockUser,
      });

      expect(result).toEqual(mockImage);
      expect(mockExtended.upsert).toHaveBeenCalled();
    });

    it('should remove old image if exists before upload', async () => {
      mockExtended.findFirst.mockResolvedValue(mockImage);
      const removeImageSpy = jest
        .spyOn(fileUtilService, 'removeImage')
        .mockResolvedValue(undefined);
      jest.spyOn(fileUtilService, 'removeFileExtension').mockReturnValue('nike-air');
      jest.spyOn(fileUtilService, 'uploadImage').mockResolvedValue({
        url: 'http://cloudinary.com/image.jpg',
        secure_url: 'https://cloudinary.com/image.jpg',
        display_name: 'nike-air',
        created_at: new Date().toISOString(),
      });
      mockExtended.upsert.mockResolvedValue(mockImage);

      await service.uploadProductImagesEvent({
        file: { originalname: 'nike-air.jpg', path: 'uploads/nike-air.jpg' } as any,
        user: mockUser,
      });

      expect(removeImageSpy).toHaveBeenCalled();
    });
  });
});
