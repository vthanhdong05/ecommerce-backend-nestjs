import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { RolePermissionsService } from './role-permissions.service';

const mockExtended = {
  findMany: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
  deleteMany: jest.fn(),
};

const mockRolesExtended = {
  createManyAndReturn: jest.fn(),
};

const mockRolesClient = {
  findMany: jest.fn(),
};

const mockPermissionsExtended = {
  createManyAndReturn: jest.fn(),
};

const mockPermissionsClient = {
  findMany: jest.fn(),
};

const mockTransaction = jest.fn();

const mockPrismaService = {
  rolePermission: {},
  extended: { rolePermission: mockExtended },
  $transaction: mockTransaction,
};

const mockExcelUtilService = {
  generateExcel: jest.fn(),
  read: jest.fn(),
};

const mockRolesService = {
  client: mockRolesClient,
  extended: mockRolesExtended,
};

const mockPermissionsService = {
  client: mockPermissionsClient,
  extended: mockPermissionsExtended,
};

const mockUsersService = {
  invalidatePermissionCache: jest.fn().mockResolvedValue(undefined),
};

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockRolePermission = {
  role: { id: 'role-id-1', name: 'Admin', description: 'Admin role' },
  permission: { id: 'perm-id-1', name: 'Create User', key: '[/users]_[create]', description: null },
};

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<RolePermissionsService>(RolePermissionsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
    jest.spyOn(service, 'client', 'get').mockReturnValue(mockRolesClient as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getRolePermissions', () => {
    it('should return grouped role permissions', async () => {
      mockExtended.findMany.mockResolvedValue([mockRolePermission]);

      const result = await service.getRolePermissions();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('role');
      expect(result[0]).toHaveProperty('permissions');
      expect(result[0].permissions).toHaveLength(1);
    });

    it('should group multiple permissions under same role', async () => {
      mockExtended.findMany.mockResolvedValue([
        mockRolePermission,
        {
          role: { id: 'role-id-1', name: 'Admin', description: 'Admin role' },
          permission: {
            id: 'perm-id-2',
            name: 'Delete User',
            key: '[/users]_[delete]',
            description: null,
          },
        },
      ]);

      const result = await service.getRolePermissions();

      expect(result).toHaveLength(1);
      expect(result[0].permissions).toHaveLength(2);
    });

    it('should return empty array when no data', async () => {
      mockExtended.findMany.mockResolvedValue([]);
      const result = await service.getRolePermissions();
      expect(result).toHaveLength(0);
    });
  });

  describe('importRolePermissions', () => {
    it('should create role permissions from excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        RolePermission: [
          { roleName: 'Admin', permissionName: 'Create User', permissionKey: '[/users]_[create]' },
        ],
      });
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Admin' }]);
      mockPermissionsClient.findMany.mockResolvedValue([{ id: 'perm-id-1', name: 'Create User' }]);
      mockTransaction.mockImplementation((fn) =>
        fn({
          rolePermission: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        }),
      );

      const result = await service.importRolePermissions({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
      expect(mockUsersService.invalidatePermissionCache).toHaveBeenCalled();
    });

    it('should throw BadRequestException if role does not exist', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        RolePermission: [
          {
            roleName: 'NotExistRole',
            permissionName: 'Create User',
            permissionKey: '[/users]_[create]',
          },
        ],
      });
      mockRolesClient.findMany.mockResolvedValue([]);
      mockPermissionsClient.findMany.mockResolvedValue([{ id: 'perm-id-1', name: 'Create User' }]);

      await expect(
        service.importRolePermissions({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if permission does not exist', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        RolePermission: [
          {
            roleName: 'Admin',
            permissionName: 'NotExistPermission',
            permissionKey: '[/new]_[create]',
          },
        ],
      });
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Admin' }]);
      mockPermissionsClient.findMany.mockResolvedValue([]);

      await expect(
        service.importRolePermissions({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportRolePermissions', () => {
    it('should generate excel with role permission data', async () => {
      mockExtended.export.mockResolvedValue([
        {
          role: { name: 'Admin' },
          permission: { name: 'Create User', key: '[/users]_[create]' },
        },
      ]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      const result = await service.exportRolePermissions({
        roleIDs: ['role-id-1'],
        permissionIDs: [],
      });

      expect(mockExtended.export).toHaveBeenCalled();
      expect(mockExcelUtilService.generateExcel).toHaveBeenCalled();
      expect(result).toBe('workbook');
    });

    it('should export all when no filter provided', async () => {
      mockExtended.export.mockResolvedValue([]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      await service.exportRolePermissions({ roleIDs: [], permissionIDs: [] });

      expect(mockExtended.export).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            roleID: { in: [] },
            permissionID: { in: [] },
          },
        }),
      );
    });
  });
});
