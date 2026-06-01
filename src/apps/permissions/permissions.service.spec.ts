import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { PermissionsService } from './permissions.service';

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
  permission: {},
  extended: { permission: mockExtended },
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

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockPermission = {
  id: 'permission-id-1',
  name: 'Create User',
  description: 'Allow create user',
  key: '[/users]_[create]',
  isSystemPermission: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaginationUtilService, useValue: mockPaginationUtilService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: QueryUtilService, useValue: mockQueryUtilService },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getPermission', () => {
    it('should return a permission by id', async () => {
      mockExtended.findUnique.mockResolvedValue(mockPermission);
      const result = await service.getPermission({ id: 'permission-id-1' });
      expect(result).toEqual(mockPermission);
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'permission-id-1' } });
    });

    it('should return null if permission not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getPermission({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getPermissions', () => {
    it('should return paginated permissions', async () => {
      mockExtended.count.mockResolvedValue(10);
      mockExtended.findMany.mockResolvedValue([mockPermission]);
      const result = await service.getPermissions({ page: 1, itemPerPage: 10 });
      expect(mockExtended.count).toHaveBeenCalled();
      expect(mockExtended.findMany).toHaveBeenCalled();
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalItems');
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      mockExtended.create.mockResolvedValue(mockPermission);
      const dto = { name: 'Create User', key: '[/users]_[create]', isSystemPermission: false };
      const result = await service.createPermission(dto, mockUser);
      expect(result).toEqual(mockPermission);
      expect(mockExtended.create).toHaveBeenCalledWith({
        data: { ...dto, user: mockUser },
      });
    });

    it('should throw if prisma throws', async () => {
      mockExtended.create.mockRejectedValue(new Error('DB error'));
      await expect(
        service.createPermission(
          { name: 'Test', key: '[/test]_[create]', isSystemPermission: false },
          mockUser,
        ),
      ).rejects.toThrow('DB error');
    });
  });

  describe('updatePermission', () => {
    it('should update a permission', async () => {
      const updated = { ...mockPermission, name: 'Updated Permission' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updatePermission({
        where: { id: 'permission-id-1' },
        data: { name: 'Updated Permission' },
      });
      expect(result.name).toBe('Updated Permission');
      expect(mockExtended.update).toHaveBeenCalledWith({
        where: { id: 'permission-id-1' },
        data: { name: 'Updated Permission' },
      });
    });
  });

  describe('deletePermission', () => {
    it('should soft delete a permission', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deletePermission({ id: 'permission-id-1' });
      expect(result).toEqual({ count: 1 });
      expect(mockExtended.softDelete).toHaveBeenCalledWith({ id: 'permission-id-1' });
    });
  });

  describe('getOptions', () => {
    it('should return permission options', async () => {
      mockExtended.findMany.mockResolvedValue([mockPermission]);
      const result = await service.getOptions({ limit: 10, select: 'id,name' });
      expect(mockExtended.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockPermission]);
    });
  });
});
