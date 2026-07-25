import { Test, TestingModule } from '@nestjs/testing';
import { RoleType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { RolesService } from './roles.service';

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

const mockPrismaService = {
  role: {},
  extended: { role: mockExtended },
  permission: { findMany: jest.fn().mockResolvedValue([]) },
  rolePermission: { findFirst: jest.fn().mockResolvedValue(null) },
  userSystemRole: { findFirst: jest.fn().mockResolvedValue(null) },
  userVendorRole: { findFirst: jest.fn().mockResolvedValue(null) },
  // Mock $transaction: chạy callback với mock tx (chính là mockPrismaService)
  $transaction: jest.fn(),
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

const mockRole = {
  id: 'role-id-1',
  name: 'Admin',
  description: 'Admin role',
  roleType: RoleType.SYSTEM,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaginationUtilService, useValue: mockPaginationUtilService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: QueryUtilService, useValue: mockQueryUtilService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getRole', () => {
    it('should return a role by id with permissions', async () => {
      mockExtended.findUnique.mockResolvedValue(mockRole);
      const result = await service.getRole({ id: 'role-id-1' });
      expect(result).toEqual(mockRole);
      // Verify gọi include rolePermissions
      expect(mockExtended.findUnique).toHaveBeenCalledWith({
        where: { id: 'role-id-1' },
        include: {
          rolePermissions: { include: { permission: true } },
        },
      });
    });

    it('should return null if role not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getRole({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getRoles', () => {
    it('should return paginated roles', async () => {
      mockExtended.count.mockResolvedValue(10);
      mockExtended.findMany.mockResolvedValue([mockRole]);

      const result = await service.getRoles({ page: 1, itemPerPage: 10 });

      expect(mockExtended.count).toHaveBeenCalled();
      expect(mockExtended.findMany).toHaveBeenCalled();
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalItems');
    });
  });

  describe('createRole', () => {
    it('should create a role without permissions', async () => {
      // Mock tx.role.create
      const txRoleCreate = jest.fn().mockResolvedValue(mockRole);
      const txRoleFindUnique = jest.fn().mockResolvedValue(mockRole);
      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb({ role: { create: txRoleCreate, findUnique: txRoleFindUnique } } as any),
      );

      const dto = { name: 'Admin', description: 'Admin role', roleType: RoleType.SYSTEM };
      const result = await service.createRole(dto, { userEmail: 'admin@test.com' } as any);

      expect(txRoleCreate).toHaveBeenCalledWith({
        data: {
          name: 'Admin',
          description: 'Admin role',
          roleType: RoleType.SYSTEM,
          createdBy: 'admin@test.com',
        },
      });
      expect(result).toEqual(mockRole);
    });

    it('should create a role with permissions', async () => {
      const txRoleCreate = jest.fn().mockResolvedValue(mockRole);
      const txRoleFindUnique = jest.fn().mockResolvedValue(mockRole);
      const txRolePermCreateMany = jest.fn().mockResolvedValue({ count: 2 });
      const txPermFindMany = jest.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb({
          role: { create: txRoleCreate, findUnique: txRoleFindUnique },
          permission: { findMany: txPermFindMany },
          rolePermission: { createMany: txRolePermCreateMany },
        } as any),
      );

      const dto = {
        name: 'Admin',
        description: 'Admin role',
        roleType: RoleType.SYSTEM,
        permissionIDs: ['p1', 'p2'],
      };
      await service.createRole(dto, { userEmail: 'admin@test.com' } as any);

      expect(txRolePermCreateMany).toHaveBeenCalledWith({
        data: [
          { roleID: 'role-id-1', permissionID: 'p1', createdBy: 'admin@test.com' },
          { roleID: 'role-id-1', permissionID: 'p2', createdBy: 'admin@test.com' },
        ],
      });
    });

    it('should throw if permissionIDs not found', async () => {
      const txRoleCreate = jest.fn().mockResolvedValue(mockRole);
      const txPermFindMany = jest.fn().mockResolvedValue([{ id: 'p1' }]); // p2 missing

      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb({
          role: { create: txRoleCreate },
          permission: { findMany: txPermFindMany },
        } as any),
      );

      await expect(
        service.createRole(
          { name: 'Admin', roleType: RoleType.SYSTEM, permissionIDs: ['p1', 'p2'] },
          { userEmail: 'admin@test.com' } as any,
        ),
      ).rejects.toThrow('Invalid permission IDs: p2');
    });
  });

  describe('updateRole', () => {
    it('should update role name only without touching permissions', async () => {
      const updated = { ...mockRole, name: 'Super Admin' };
      const txRoleUpdate = jest.fn().mockResolvedValue(updated);
      const txRoleFindUnique = jest.fn().mockResolvedValue(updated);

      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb({
          role: { update: txRoleUpdate, findUnique: txRoleFindUnique },
        } as any),
      );

      const result = await service.updateRole({
        where: { id: 'role-id-1' },
        data: { name: 'Super Admin' },
        user: { userEmail: 'admin@test.com' } as any,
      });

      expect(result.name).toBe('Super Admin');
      // Không truyền permissionIDs → không gọi rolePermission.deleteMany
      expect(txRoleUpdate).toHaveBeenCalledWith({
        where: { id: 'role-id-1' },
        data: { name: 'Super Admin' },
      });
    });

    it('should replace permissions when permissionIDs provided', async () => {
      const updated = { ...mockRole, name: 'Admin' };
      const txRoleUpdate = jest.fn().mockResolvedValue(updated);
      const txRolePermDeleteMany = jest.fn().mockResolvedValue({ count: 3 });
      const txRolePermCreateMany = jest.fn().mockResolvedValue({ count: 2 });
      const txPermFindMany = jest.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
      const txRoleFindUnique = jest.fn().mockResolvedValue(updated);

      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb({
          role: { update: txRoleUpdate, findUnique: txRoleFindUnique },
          permission: { findMany: txPermFindMany },
          rolePermission: { deleteMany: txRolePermDeleteMany, createMany: txRolePermCreateMany },
        } as any),
      );

      await service.updateRole({
        where: { id: 'role-id-1' },
        data: { permissionIDs: ['p1', 'p2'] },
        user: { userEmail: 'admin@test.com' } as any,
      });

      expect(txRolePermDeleteMany).toHaveBeenCalledWith({ where: { roleID: 'role-id-1' } });
      expect(txRolePermCreateMany).toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    it('should soft delete a role', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });

      const result = await service.deleteRole({ id: 'role-id-1' });

      expect(result).toEqual({ count: 1 });
      expect(mockExtended.softDelete).toHaveBeenCalledWith({ id: 'role-id-1' });
    });
  });

  describe('getOptions', () => {
    it('should return role options', async () => {
      mockExtended.findMany.mockResolvedValue([mockRole]);

      const result = await service.getOptions({ limit: 10, select: 'id,name' });

      expect(mockExtended.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockRole]);
    });
  });
});
