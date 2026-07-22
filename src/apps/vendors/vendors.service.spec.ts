import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from './vendors.service';

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

const mockUsersClient = { findMany: jest.fn() };
const mockUserVendorRole = { findUnique: jest.fn() };

const mockPrismaService = {
  vendor: {},
  extended: { vendor: mockExtended },
  userVendorRole: mockUserVendorRole,
};

const mockPaginationUtilService = {
  paging: jest.fn().mockReturnValue({
    skip: 0,
    format: jest.fn().mockReturnValue({ list: [], totalPages: 0, totalItems: 0 }),
  }),
};

const mockExcelUtilService = {
  generateExcel: jest.fn(),
  read: jest.fn(),
};

const mockQueryUtilService = {
  convertFieldsSelectOption: jest.fn().mockReturnValue({}),
};

const mockUsersService = { client: mockUsersClient };

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com', roleType: null };

const mockVendor = {
  id: 'vendor-id-1',
  name: 'Nike Vietnam',
  slug: 'nike-vietnam',
  description: null,
  logoUrl: null,
  taxCode: null,
  totalProducts: 0,
  totalOrders: 0,
  status: 'active',
  userID: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

describe('VendorsService', () => {
  let service: VendorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaginationUtilService, useValue: mockPaginationUtilService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: QueryUtilService, useValue: mockQueryUtilService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getVendor', () => {
    it('should return vendor by id', async () => {
      mockExtended.findUnique.mockResolvedValue(mockVendor);
      const result = await service.getVendor({ id: 'vendor-id-1' });
      expect(result).toEqual(mockVendor);
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'vendor-id-1' } });
    });

    it('should return null if not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getVendor({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getVendorProfile', () => {
    it('should return vendor profile', async () => {
      mockExtended.findUnique.mockResolvedValue(mockVendor);
      const result = await service.getVendorProfile('vendor-id-1');
      expect(result).toEqual(mockVendor);
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'vendor-id-1' } });
    });

    it('should return null if not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getVendorProfile('not-exist');
      expect(result).toBeNull();
    });
  });

  describe('getVendors', () => {
    it('should return paginated vendors', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockVendor]);

      const result = await service.getVendors({ page: 1, itemPerPage: 10 });

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalItems');
    });
  });

  describe('createVendor', () => {
    it('should create vendor with userID', async () => {
      mockExtended.create.mockResolvedValue(mockVendor);

      const dto = { name: 'Nike Vietnam', description: null };
      const result = await service.createVendor(dto, mockUser);

      expect(result).toEqual(mockVendor);
      expect(mockExtended.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userID: mockUser.userID }),
      });
    });
  });

  describe('updateVendor', () => {
    it('should update vendor', async () => {
      const updated = { ...mockVendor, name: 'Adidas Vietnam' };
      mockExtended.update.mockResolvedValue(updated);

      const result = await service.updateVendor({
        where: { id: 'vendor-id-1' },
        data: { name: 'Adidas Vietnam' },
      });

      expect(result.name).toBe('Adidas Vietnam');
    });
  });

  describe('updateVendorProfile', () => {
    it('should update vendor profile', async () => {
      const updated = { ...mockVendor, description: 'New description' };
      mockUserVendorRole.findUnique.mockResolvedValue({
        userID: 'user-id-1',
        vendorID: 'vendor-id-1',
      });
      mockExtended.update.mockResolvedValue(updated);

      const result = await service.updateVendorProfile({
        vendorID: 'vendor-id-1',
        userID: 'user-id-1',
        data: { description: 'New description' },
      });

      expect(result.description).toBe('New description');
      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'vendor-id-1' },
        data: { description: 'New description' },
      });
    });

    it('should throw NotFoundException if user does not have a role in the vendor', async () => {
      mockUserVendorRole.findUnique.mockResolvedValue(null);

      await expect(
        service.updateVendorProfile({
          vendorID: 'vendor-id-1',
          userID: 'user-id-1',
          data: { description: 'New description' },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteVendor', () => {
    it('should soft delete vendor', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deleteVendor({ id: 'vendor-id-1' });
      expect(result).toEqual({ count: 1 });
      expect(mockExtended.softDelete).toHaveBeenCalledWith({ id: 'vendor-id-1' });
    });
  });

  describe('getOptions', () => {
    it('should return vendor options', async () => {
      mockExtended.findMany.mockResolvedValue([mockVendor]);
      const result = await service.getOptions({ limit: 10, select: 'id,name' });
      expect(result).toEqual([mockVendor]);
    });
  });

  describe('importVendors', () => {
    it('should import vendors from excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        Vendor: [{ userEmail: 'test@test.com', name: 'Nike Vietnam' }],
      });
      mockUsersClient.findMany.mockResolvedValue([{ id: 'user-id-1', email: 'test@test.com' }]);
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importVendors({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should throw if user email not found', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        Vendor: [{ userEmail: 'notfound@test.com', name: 'Nike Vietnam' }],
      });
      mockUsersClient.findMany.mockResolvedValue([]);

      await expect(
        service.importVendors({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportVendors', () => {
    it('should generate excel with vendor data', async () => {
      mockExtended.export.mockResolvedValue([{ ...mockVendor, user: { email: 'test@test.com' } }]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      const result = await service.exportVendors({ ids: ['vendor-id-1'] });

      expect(result).toBe('workbook');
      expect(mockExcelUtilService.generateExcel).toHaveBeenCalled();
    });
  });
});
