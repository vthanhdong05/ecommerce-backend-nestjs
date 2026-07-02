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
  rolePermission: { findFirst: jest.fn().mockResolvedValue(null) },
  userSystemRole: { findFirst: jest.fn().mockResolvedValue(null) },
  userVendorRole: { findFirst: jest.fn().mockResolvedValue(null) },
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
    it('should return a role by id', async () => {
      mockExtended.findUnique.mockResolvedValue(mockRole);
      const result = await service.getRole({ id: 'role-id-1' });
      expect(result).toEqual(mockRole); // Kiểm tra output của service
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'role-id-1' } });
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
    it('should create a role', async () => {
      mockExtended.create.mockResolvedValue(mockRole);

      const dto = { name: 'Admin', description: 'Admin role', roleType: RoleType.SYSTEM };
      const result = await service.createRole(dto);

      expect(result).toEqual(mockRole);
      expect(mockExtended.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const updated = { ...mockRole, name: 'Super Admin' };
      mockExtended.update.mockResolvedValue(updated);

      const result = await service.updateRole({
        where: { id: 'role-id-1' },
        data: { name: 'Super Admin' },
      });

      expect(result.name).toBe('Super Admin');
      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'role-id-1' },
        data: { name: 'Super Admin' },
      });
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
