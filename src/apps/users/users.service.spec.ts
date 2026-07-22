import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { UsersService } from './users.service';

const mockExtended = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  softDelete: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
};

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com', roleType: null };

const mockUserData = {
  id: 'user-id-1',
  email: 'test@test.com',
  password: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe',
  fullAddress: null,
  city: null,
  province: null,
  country: null,
  phone: null,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
};

describe('UsersService', () => {
  let service: UsersService;
  let paginationUtilService: PaginationUtilService;
  let stringUtilService: StringUtilService;
  let excelUtilService: ExcelUtilService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module = await AutoMockingModule.createTestingModule({
      providers: [UsersService],
    });

    service = module.get<UsersService>(UsersService);
    paginationUtilService = module.get<PaginationUtilService>(PaginationUtilService);
    stringUtilService = module.get<StringUtilService>(StringUtilService);
    excelUtilService = module.get<ExcelUtilService>(ExcelUtilService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);

    jest.spyOn(paginationUtilService, 'paging').mockReturnValue({
      skip: 0,
      format: jest.fn().mockReturnValue({ list: [], totalPages: 0, totalItems: 0 }),
    } as any);

    jest.spyOn(stringUtilService, 'hash').mockResolvedValue('hashed_password');
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUser', () => {
    it('should return user by id', async () => {
      mockExtended.findUnique.mockResolvedValue(mockUserData);
      const result = await service.getUser({ id: 'user-id-1' });
      expect(result).toEqual(mockUserData);
      expect(mockExtended.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    });

    it('should return null if user not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getUser({ id: 'not-exist' });
      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      mockExtended.findUnique.mockResolvedValue(mockUserData);
      const result = await service.getUserProfile('user-id-1');
      expect(result).toEqual(mockUserData);
    });

    it('should return null if not found', async () => {
      mockExtended.findUnique.mockResolvedValue(null);
      const result = await service.getUserProfile('not-exist');
      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should return cached data if exists', async () => {
      const cached = { list: [mockUserData], totalPages: 1, totalItems: 1 };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cached);

      const result = await service.getUsers({ page: 1, itemPerPage: 10 });

      expect(result).toEqual(cached);
      expect(mockExtended.count).not.toHaveBeenCalled();
    });

    it('should fetch from db and set cache if no cache', async () => {
      mockExtended.count.mockResolvedValue(1);
      mockExtended.findMany.mockResolvedValue([mockUserData]);

      const result = await service.getUsers({ page: 1, itemPerPage: 10 });

      expect(mockExtended.count).toHaveBeenCalled();
      expect(mockExtended.findMany).toHaveBeenCalled();
      expect(result).toHaveProperty('list');
    });
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      mockExtended.create.mockResolvedValue(mockUserData);
      const dto = { email: 'test@test.com', password: '123456' };
      const result = await service.createUser(dto);
      expect(jest.spyOn(stringUtilService, 'hash')).toHaveBeenCalledWith('123456');
      expect(result).toEqual(mockUserData);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updated = { ...mockUserData, firstName: 'Jane' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateUser({
        where: { id: 'user-id-1' },
        data: { firstName: 'Jane' },
      });
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const updated = { ...mockUserData, firstName: 'Jane' };
      mockExtended.update.mockResolvedValue(updated);
      const result = await service.updateUserProfile({
        userID: 'user-id-1',
        data: { firstName: 'Jane' },
      });
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockExtended.softDelete.mockResolvedValue({ count: 1 });
      const result = await service.deleteUser({ id: 'user-id-1' });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('getOptions', () => {
    it('should return user options', async () => {
      mockExtended.findMany.mockResolvedValue([mockUserData]);
      const result = await service.getOptions({ limit: 10, select: 'id,email' });
      expect(result).toEqual([mockUserData]);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true if user is super admin', async () => {
      mockExtended.findFirst.mockResolvedValue(mockUserData);
      const result = await service.isSuperAdmin('user-id-1');
      expect(result).toBe(true);
    });

    it('should return false if not super admin', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      const result = await service.isSuperAdmin('user-id-1');
      expect(result).toBe(false);
    });
  });

  describe('isExistPermissionKey', () => {
    it('should return false if permissionKey is empty', async () => {
      const result = await service.isExistPermissionKey({
        userID: 'user-id-1',
        permissionKey: '',
      });
      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockExtended.findFirst.mockResolvedValue(null);
      const result = await service.isExistPermissionKey({
        userID: 'user-id-1',
        permissionKey: '[/users]_[read]',
      });
      expect(result).toBe(false);
    });

    it('should return true if exact permission key matches', async () => {
      mockExtended.findFirst.mockResolvedValue({
        userSystemRoles: [
          { role: { rolePermissions: [{ permission: { key: '[/users]_[read]' } }] } },
        ],
        userVendorRoles: [],
      });
      const result = await service.isExistPermissionKey({
        userID: 'user-id-1',
        permissionKey: '[/users]_[read]',
      });
      expect(result).toBe(true);
    });

    it('should return true if user has MANAGE permission', async () => {
      mockExtended.findFirst.mockResolvedValue({
        userSystemRoles: [
          { role: { rolePermissions: [{ permission: { key: '[/users]_[manage]' } }] } },
        ],
        userVendorRoles: [],
      });
      const result = await service.isExistPermissionKey({
        userID: 'user-id-1',
        permissionKey: '[/users]_[read]',
      });
      expect(result).toBe(true);
    });

    it('should return false if no matching permission', async () => {
      mockExtended.findFirst.mockResolvedValue({
        userSystemRoles: [
          { role: { rolePermissions: [{ permission: { key: '[/roles]_[read]' } }] } },
        ],
        userVendorRoles: [],
      });
      const result = await service.isExistPermissionKey({
        userID: 'user-id-1',
        permissionKey: '[/users]_[read]',
      });
      expect(result).toBe(false);
    });
  });

  describe('importUsers', () => {
    it('should import users with hashed passwords', async () => {
      jest.spyOn(excelUtilService, 'read').mockResolvedValue({
        User: [{ email: 'test@test.com', password: '123456' }],
      });
      mockExtended.createMany.mockResolvedValue({ count: 1 });

      const result = await service.importUsers({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(jest.spyOn(stringUtilService, 'hash')).toHaveBeenCalledWith('123456');
      expect(result).toEqual({ count: 1 });
    });

    it('should throw if password is invalid in excel', async () => {
      jest.spyOn(excelUtilService, 'read').mockResolvedValue({
        User: [{ email: 'test@test.com', password: null }],
      });

      await expect(
        service.importUsers({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
