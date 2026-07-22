import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleType, UserVendorRoleStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { UserVendorRolesService } from './user-vendor-roles.service';

const mockExtended = {
  findFirst: jest.fn(),
  findMany: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
  deleteMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUsersClient = { findMany: jest.fn(), findUnique: jest.fn() };
const mockRolesClient = { findMany: jest.fn(), findFirst: jest.fn() };
const mockVendorsClient = { findMany: jest.fn() };

const mockTransaction = jest.fn();

const mockPrismaService = {
  userVendorRole: {},
  extended: { userVendorRole: mockExtended },
  $transaction: mockTransaction,
};

const mockExcelUtilService = {
  generateExcel: jest.fn(),
  read: jest.fn(),
};

const mockUsersService = { client: mockUsersClient };
const mockRolesService = { client: mockRolesClient };
const mockVendorsService = { client: mockVendorsClient };

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com', roleType: null };

const mockUserVendorRole = {
  user: { id: 'user-id-1', email: 'test@test.com' },
  vendor: { id: 'vendor-id-1', name: 'Nike', description: null },
  role: { id: 'role-id-1', name: 'Manager', description: null },
};

describe('UserVendorRolesService', () => {
  let service: UserVendorRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserVendorRolesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: VendorsService, useValue: mockVendorsService },
      ],
    }).compile();

    service = module.get<UserVendorRolesService>(UserVendorRolesService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUserVendorRoles', () => {
    it('should return grouped by vendor', async () => {
      mockExtended.findMany.mockResolvedValue([mockUserVendorRole]);
      const result = await service.getUserVendorRoles();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('vendor');
      expect(result[0]).toHaveProperty('members');
      expect(result[0].members).toHaveLength(1);
    });

    it('should group multiple members under same vendor', async () => {
      mockExtended.findMany.mockResolvedValue([
        mockUserVendorRole,
        {
          user: { id: 'user-id-2', email: 'test2@test.com' },
          vendor: { id: 'vendor-id-1', name: 'Nike', description: null },
          role: { id: 'role-id-1', name: 'Staff', description: null },
        },
      ]);
      const result = await service.getUserVendorRoles();
      expect(result).toHaveLength(1);
      expect(result[0].members).toHaveLength(2);
    });

    it('should return empty array when no data', async () => {
      mockExtended.findMany.mockResolvedValue([]);
      const result = await service.getUserVendorRoles();
      expect(result).toHaveLength(0);
    });
  });

  describe('getMembers', () => {
    it('should return members of a vendor', async () => {
      mockExtended.findMany.mockResolvedValue([
        {
          id: 'uvr-id-1',
          status: UserVendorRoleStatus.active,
          user: { id: 'user-id-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' },
          role: { id: 'role-id-1', name: 'Manager' },
        },
      ]);
      const result = await service.getMembers('vendor-id-1');
      expect(result).toHaveLength(1);
      expect(mockExtended.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { vendorID: 'vendor-id-1' } }),
      );
    });
  });

  describe('addMember', () => {
    it('should add a member to vendor', async () => {
      mockUsersClient.findUnique.mockResolvedValue({ id: 'user-id-1' });
      mockRolesClient.findFirst.mockResolvedValue({ id: 'role-id-1', roleType: RoleType.VENDOR });
      mockExtended.create.mockResolvedValue({ id: 'uvr-id-1' });

      const result = await service.addMember({
        vendorID: 'vendor-id-1',
        userID: 'user-id-1',
        roleID: 'role-id-1',
        user: mockUser,
      });

      expect(result).toEqual({ id: 'uvr-id-1' });
      expect(mockExtended.create).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockUsersClient.findUnique.mockResolvedValue(null);

      await expect(
        service.addMember({
          vendorID: 'vendor-id-1',
          userID: 'not-exist',
          roleID: 'role-id-1',
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if role is not VENDOR type', async () => {
      mockUsersClient.findUnique.mockResolvedValue({ id: 'user-id-1' });
      mockRolesClient.findFirst.mockResolvedValue(null);

      await expect(
        service.addMember({
          vendorID: 'vendor-id-1',
          userID: 'user-id-1',
          roleID: 'invalid-role',
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMember', () => {
    it('should update member role', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'uvr-id-1', vendorID: 'vendor-id-1' });
      mockRolesClient.findFirst.mockResolvedValue({ id: 'role-id-2', roleType: RoleType.VENDOR });
      mockExtended.update.mockResolvedValue({ id: 'uvr-id-1', roleID: 'role-id-2' });

      const result = await service.updateMember({
        id: 'uvr-id-1',
        vendorID: 'vendor-id-1',
        roleID: 'role-id-2',
        user: mockUser,
      });

      expect(result).toHaveProperty('roleID', 'role-id-2');
    });

    it('should throw if member not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMember({
          id: 'uvr-id-1',
          vendorID: 'vendor-id-1',
          roleID: 'role-id-2',
          user: mockUser,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if new role is not VENDOR type', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'uvr-id-1', vendorID: 'vendor-id-1' });
      mockRolesClient.findFirst.mockResolvedValue(null);

      await expect(
        service.updateMember({
          id: 'uvr-id-1',
          vendorID: 'vendor-id-1',
          roleID: 'invalid-role',
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update status without checking role', async () => {
      mockExtended.findFirst.mockResolvedValue({ id: 'uvr-id-1', vendorID: 'vendor-id-1' });
      mockExtended.update.mockResolvedValue({
        id: 'uvr-id-1',
        status: UserVendorRoleStatus.inactive,
      });

      const result = await service.updateMember({
        id: 'uvr-id-1',
        vendorID: 'vendor-id-1',
        status: UserVendorRoleStatus.inactive,
        user: mockUser,
      });

      expect(result).toHaveProperty('status', UserVendorRoleStatus.inactive);
      expect(mockRolesClient.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      mockExtended.findFirst.mockResolvedValue({
        id: 'uvr-id-1',
        vendorID: 'vendor-id-1',
        userID: 'user-id-2',
        vendor: { userID: 'user-id-1' },
      });
      mockExtended.delete.mockResolvedValue({ id: 'uvr-id-1' });
      const result = await service.removeMember('uvr-id-1', 'vendor-id-1', 'user-id-1');
      expect(result).toEqual({ id: 'uvr-id-1' });
      expect(mockExtended.delete).toHaveBeenCalledWith({ where: { id: 'uvr-id-1' } });
    });

    it('should throw NotFoundException if member to remove not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      await expect(service.removeMember('not-exist', 'vendor-id-1', 'user-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exportUserVendorRoles', () => {
    it('should generate excel with user vendor role data', async () => {
      mockExtended.export.mockResolvedValue([
        { user: { email: 'test@test.com' }, vendor: { name: 'Nike' }, role: { name: 'Manager' } },
      ]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      const result = await service.exportUserVendorRoles({
        userIDs: ['user-id-1'],
        vendorIDs: ['vendor-id-1'],
        roleIDs: ['role-id-1'],
      });

      expect(result).toBe('workbook');
      expect(mockExcelUtilService.generateExcel).toHaveBeenCalled();
    });

    it('should return empty row when no data', async () => {
      mockExtended.export.mockResolvedValue([]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      await service.exportUserVendorRoles({ userIDs: [], vendorIDs: [], roleIDs: [] });

      expect(mockExcelUtilService.generateExcel).toHaveBeenCalledWith(
        expect.objectContaining({
          worksheets: expect.arrayContaining([
            expect.objectContaining({
              data: [{ userEmail: '', vendorName: '', roleName: '' }],
            }),
          ]),
        }),
      );
    });
  });

  describe('importUserVendorRoles', () => {
    it('should import user vendor roles from excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserVendorRole: [{ userEmail: 'test@test.com', vendorName: 'Nike', roleName: 'Manager' }],
      });
      mockUsersClient.findMany.mockResolvedValue([{ id: 'user-id-1', email: 'test@test.com' }]);
      mockVendorsClient.findMany.mockResolvedValue([{ id: 'vendor-id-1', name: 'Nike' }]);
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Manager' }]);
      mockTransaction.mockImplementation((fn) =>
        fn({
          userVendorRole: {
            deleteMany: jest.fn(),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        }),
      );

      const result = await service.importUserVendorRoles({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should throw if user not found in excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserVendorRole: [
          { userEmail: 'notfound@test.com', vendorName: 'Nike', roleName: 'Manager' },
        ],
      });
      mockUsersClient.findMany.mockResolvedValue([]);
      mockVendorsClient.findMany.mockResolvedValue([{ id: 'vendor-id-1', name: 'Nike' }]);
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Manager' }]);

      await expect(
        service.importUserVendorRoles({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if vendor not found in excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserVendorRole: [
          { userEmail: 'test@test.com', vendorName: 'NotExist', roleName: 'Manager' },
        ],
      });
      mockUsersClient.findMany.mockResolvedValue([{ id: 'user-id-1', email: 'test@test.com' }]);
      mockVendorsClient.findMany.mockResolvedValue([]);
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Manager' }]);

      await expect(
        service.importUserVendorRoles({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
