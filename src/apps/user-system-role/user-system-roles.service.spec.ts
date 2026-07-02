import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { UserSystemRolesService } from './user-system-roles.service';

const mockExtended = {
  findMany: jest.fn(),
  export: jest.fn(),
  createMany: jest.fn(),
  deleteMany: jest.fn(),
};

const mockUsersClient = { findMany: jest.fn() };
const mockRolesClient = { findMany: jest.fn() };

const mockTransaction = jest.fn();

const mockPrismaService = {
  userSystemRole: {},
  extended: { userSystemRole: mockExtended },
  $transaction: mockTransaction,
};

const mockExcelUtilService = {
  generateExcel: jest.fn(),
  read: jest.fn(),
};

const mockUsersService = {
  client: mockUsersClient,
  invalidatePermissionCache: jest.fn().mockResolvedValue(undefined),
};
const mockRolesService = { client: mockRolesClient };

const mockUser = { userID: 'user-id-1', userEmail: 'test@test.com' };

const mockUserSystemRole = {
  user: { id: 'user-id-1', email: 'test@test.com' },
  role: { id: 'role-id-1', name: 'Admin', description: 'Admin role' },
};

describe('UserSystemRolesService', () => {
  let service: UserSystemRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSystemRolesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ExcelUtilService, useValue: mockExcelUtilService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<UserSystemRolesService>(UserSystemRolesService);
    jest.spyOn(service, 'extended', 'get').mockReturnValue(mockExtended as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUserSystemRoles', () => {
    it('should return grouped user system roles', async () => {
      mockExtended.findMany.mockResolvedValue([mockUserSystemRole]);

      const result = await service.getUserSystemRoles();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('user');
      expect(result[0]).toHaveProperty('roles');
      expect(result[0].roles).toHaveLength(1);
    });

    it('should group multiple roles under same user', async () => {
      mockExtended.findMany.mockResolvedValue([
        mockUserSystemRole,
        {
          user: { id: 'user-id-1', email: 'test@test.com' },
          role: { id: 'role-id-2', name: 'System', description: null },
        },
      ]);

      const result = await service.getUserSystemRoles();

      expect(result).toHaveLength(1);
      expect(result[0].roles).toHaveLength(2);
    });

    it('should return empty array when no data', async () => {
      mockExtended.findMany.mockResolvedValue([]);
      const result = await service.getUserSystemRoles();
      expect(result).toHaveLength(0);
    });
  });

  describe('importUserSystemRoles', () => {
    it('should import user system roles from excel', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserSystemRole: [{ userEmail: 'test@test.com', roleName: 'Admin' }],
      });
      mockUsersClient.findMany.mockResolvedValue([{ id: 'user-id-1', email: 'test@test.com' }]);
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Admin' }]);

      const mockDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
      const mockCreateMany = jest.fn().mockResolvedValue({ count: 1 });
      mockTransaction.mockImplementation((fn) =>
        fn({
          userSystemRole: {
            deleteMany: mockDeleteMany,
            createMany: mockCreateMany,
          },
        }),
      );

      const result = await service.importUserSystemRoles({
        file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
        user: mockUser,
      });

      expect(result).toEqual({ count: 1 });
      expect(mockDeleteMany).toHaveBeenCalled();
      expect(mockCreateMany).toHaveBeenCalled();
    });

    it('should throw if user email not found', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserSystemRole: [{ userEmail: 'notfound@test.com', roleName: 'Admin' }],
      });
      mockUsersClient.findMany.mockResolvedValue([]);
      mockRolesClient.findMany.mockResolvedValue([{ id: 'role-id-1', name: 'Admin' }]);

      await expect(
        service.importUserSystemRoles({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if role name not found', async () => {
      mockExcelUtilService.read.mockResolvedValue({
        UserSystemRole: [{ userEmail: 'test@test.com', roleName: 'NotExist' }],
      });
      mockUsersClient.findMany.mockResolvedValue([{ id: 'user-id-1', email: 'test@test.com' }]);
      mockRolesClient.findMany.mockResolvedValue([]);

      await expect(
        service.importUserSystemRoles({
          file: { path: 'test.xlsx', originalname: 'test.xlsx' } as any,
          user: mockUser,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportUserSystemRoles', () => {
    it('should generate excel with user system role data', async () => {
      mockExtended.export.mockResolvedValue([
        {
          user: { email: 'test@test.com' },
          role: { name: 'Admin' },
        },
      ]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      const result = await service.exportUserSystemRoles({
        userIDs: ['user-id-1'],
        roleIDs: ['role-id-1'],
      });

      expect(mockExtended.export).toHaveBeenCalled();
      expect(mockExcelUtilService.generateExcel).toHaveBeenCalled();
      expect(result).toBe('workbook');
    });

    it('should return empty row when no data', async () => {
      mockExtended.export.mockResolvedValue([]);
      mockExcelUtilService.generateExcel.mockReturnValue('workbook');

      await service.exportUserSystemRoles({ userIDs: [], roleIDs: [] });

      expect(mockExcelUtilService.generateExcel).toHaveBeenCalledWith(
        expect.objectContaining({
          worksheets: expect.arrayContaining([
            expect.objectContaining({
              data: [{ userEmail: '', roleName: '' }],
            }),
          ]),
        }),
      );
    });
  });
});
