import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
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

const mockPrismaService = {
  rolePermission: {},
  extended: { rolePermission: mockExtended },
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
      mockRolesExtended.createManyAndReturn.mockResolvedValue([]);
      mockPermissionsExtended.createManyAndReturn.mockResolvedValue([]);
      mockExtended.deleteMany.mockResolvedValue({ count: 1 });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importRolePermissions({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
    });

    it('should create new roles if not exist', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        RolePermission: [
          {
            roleName: 'NewRole',
            permissionName: 'Create User',
            permissionKey: '[/users]_[create]',
          },
        ],
      });

      mockRolesClient.findMany.mockResolvedValue([]);
      mockPermissionsClient.findMany.mockResolvedValue([{ id: 'perm-id-1', name: 'Create User' }]);
      mockRolesExtended.createManyAndReturn.mockResolvedValue([
        { id: 'role-id-2', name: 'NewRole' },
      ]);
      mockPermissionsExtended.createManyAndReturn.mockResolvedValue([]); // ← thêm mock trả về []
      mockExtended.deleteMany.mockResolvedValue({ count: 0 });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importRolePermissions({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(mockRolesExtended.createManyAndReturn).toHaveBeenCalled();
      expect(result).toEqual({ count: 1 });
    });

    it('should create new permissions if not exist', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        RolePermission: [
          { roleName: 'Admin', permissionName: 'NewPermission', permissionKey: '[/new]_[create]' },
        ],
      });

      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Admin' }]);
      mockPermissionsClient.findMany.mockResolvedValue([]);
      mockPermissionsExtended.createManyAndReturn.mockResolvedValue([
        { id: 'perm-id-2', name: 'NewPermission' },
      ]);
      mockExtended.deleteMany.mockResolvedValue({ count: 0 });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importRolePermissions({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(mockPermissionsExtended.createManyAndReturn).toHaveBeenCalled();
      expect(result).toEqual({ count: 1 });
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
