import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import { Actions } from 'src/common/guards/access-control/access-control.const';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';
import { normalizeRoute } from 'src/common/utils/data-format/data-fomat.util';
import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateUserDto, ImportUsersDto } from './dto/create-user.dto';
import {
  ExportUsersDto,
  GetUsersPaginationDto,
  IsExistPermissionKeyDto,
  USER_SORTABLE_FIELDS,
} from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends PrismaBaseService<'user'> implements Options<User> {
  private userEntityName = User.name;
  private excelSheets = {
    [this.userEntityName]: this.userEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
    private stringUtilServive: StringUtilService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cacheHelper: CacheHelperService,
  ) {
    super(prismaService, 'user');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.extended.findUnique({
      where,
    });
    if (!user) return user;
    const roleType = await this.getUserRoleType(user.id);
    return { ...user, roleType };
  }

  async getUserProfile(userID: User['id']) {
    const user = await this.extended.findUnique({
      where: { id: userID },
    });
    if (!user) return user;
    const roleType = await this.getUserRoleType(user.id);
    return { ...user, roleType };
  }

  async getUserRoleType(userId: string): Promise<RoleType | null> {
    const systemRole = await this.prismaService.userSystemRole.findFirst({
      where: { userID: userId, status: 'active' },
      include: { role: true },
    });
    if (systemRole) {
      return systemRole.role.roleType;
    }
    const vendorRole = await this.prismaService.userVendorRole.findFirst({
      where: { userID: userId, status: 'active' },
      include: { role: true },
    });
    return vendorRole?.role.roleType ?? null;
  }

  async getUsers({ page, itemPerPage, ...filters }: GetUsersPaginationDto) {
    // Cache key bao gồm cả filter để tránh cache sai
    const filterKey = JSON.stringify(filters);
    const cacheKey = `users:list:${page}:${itemPerPage}:${filterKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    // Build Prisma where từ filter. Dùng AND-style merge để email/roleType cùng lúc đều hoạt động.
    const userFieldsWhere: Prisma.UserWhereInput = {};
    if (filters.email) userFieldsWhere.email = { contains: filters.email, mode: 'insensitive' };
    if (filters.firstName) userFieldsWhere.firstName = { contains: filters.firstName };
    if (filters.lastName) userFieldsWhere.lastName = { contains: filters.lastName };
    if (filters.status) userFieldsWhere.status = filters.status;
    // roleType không phải field của User — nó đến từ relation. Lọc user có role tương ứng.
    // `USER` (null) nghĩa là user không có row active nào trong 2 bảng role.
    const roleClauses: Prisma.UserWhereInput[] = [];
    if (filters.roleType === 'USER') {
      roleClauses.push({
        userSystemRoles: { none: { status: 'active' } },
        userVendorRoles: { none: { status: 'active' } },
      });
    } else if (filters.roleType === 'VENDOR') {
      roleClauses.push({
        userVendorRoles: { some: { status: 'active', role: { roleType: 'VENDOR' } } },
      });
    } else if (filters.roleType === 'SYSTEM' || filters.roleType === 'SUPER_ADMIN') {
      roleClauses.push({
        userSystemRoles: { some: { status: 'active', role: { roleType: filters.roleType } } },
      });
    }
    const where: Prisma.UserWhereInput = {
      AND: [userFieldsWhere, ...(roleClauses.length ? roleClauses : [])],
    };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    // Build orderBy an toàn — whitelist field để tránh Prisma throw trên field lạ.
    // Luôn tie-break bằng id desc để page boundary ổn định khi nhiều row có cùng giá trị sort.
    const sortBy = (filters.sortBy as string | undefined) ?? 'createdAt';
    const sortOrder: 'asc' | 'desc' = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    const safeSortBy = (USER_SORTABLE_FIELDS as readonly string[]).includes(sortBy)
      ? sortBy
      : 'createdAt';
    const orderBy: Prisma.UserOrderByWithRelationInput[] = [
      { [safeSortBy]: sortOrder },
      { id: 'desc' },
    ];
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      orderBy,
    });
    // Lấy roleType cho từng user (batch query để tránh N+1)
    const userIDs = list.map((u) => u.id);
    const [systemRoles, vendorRoles] = await Promise.all([
      this.prismaService.userSystemRole.findMany({
        where: { userID: { in: userIDs }, status: 'active' },
        select: { userID: true, role: { select: { roleType: true } } },
      }),
      this.prismaService.userVendorRole.findMany({
        where: { userID: { in: userIDs }, status: 'active' },
        select: { userID: true, role: { select: { roleType: true } } },
      }),
    ]);
    const roleTypeMap = new Map<string, RoleType>();
    for (const sr of systemRoles) {
      roleTypeMap.set(sr.userID, sr.role.roleType);
    }
    for (const vr of vendorRoles) {
      if (!roleTypeMap.has(vr.userID)) {
        roleTypeMap.set(vr.userID, vr.role.roleType);
      }
    }
    const listWithRoleType = list.map((user) => ({
      ...user,
      roleType: roleTypeMap.get(user.id) ?? null,
    }));
    const data = paging.format(listWithRoleType);
    // TTL 60 giây
    await this.cacheManager.set(cacheKey, data, 60 * 1000);
    return data;
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await this.stringUtilServive.hash(createUserDto.password);
    const data = await this.extended.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    // List cache stale ngay sau khi tạo: invalidate theo pattern users:list:*
    await this.invalidateUsersCache();
    return data;
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: UpdateUserDto }) {
    const { where, data: dataUpdate } = params;
    if (dataUpdate.password) {
      dataUpdate.password = await this.stringUtilServive.hash(dataUpdate.password);
    }
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    // Sau update, list cache (inactive cache 60s) trả data cũ → cần xoá.
    await this.invalidateUsersCache();
    return data;
  }

  async updateUserProfile(params: { userID: User['id']; data: UpdateUserDto }) {
    const { userID, data: dataUpdate } = params;
    if (dataUpdate.password) {
      dataUpdate.password = await this.stringUtilServive.hash(dataUpdate.password);
    }
    const data = await this.extended.update({
      where: { id: userID },
      data: dataUpdate,
    });
    await this.invalidateUsersCache();
    return data;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    // const data = await this.extended.delete({
    //   where,
    // });
    const data = await this.extended.softDelete(where);
    // Soft delete cũng làm list stale (totalItems giảm, row ẩn).
    await this.invalidateUsersCache();
    return data;
  }

  async getOptions(params: GetOptionsParams<User>) {
    const { limit, select, ...searchFields } = params;
    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);
    const data = await this.extended.findMany({
      select: fieldsSelect,
      where: {
        ...searchFields,
      },
      take: Number(limit),
    });
    return data;
  }

  async exportUsers({ ids }: ExportUsersDto) {
    const users = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });
    // (Tạo file excel)
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userEntityName],
          data: users,
        },
      ],
    });
    return data;
  }

  async importUsers({ file, user }: ImportUsersDto) {
    const userSheetName = this.excelSheets[this.userEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    // Duyệt từng dòng Excel + xử lý async (hash password)
    const dataMapped = await Promise.all(
      dataCreated[userSheetName].map(async (item) => {
        if (!item.password || typeof item.password !== 'string') {
          throw new BadRequestException('Invalid password in Excel');
        }
        const cleanItem = Object.fromEntries(
          Object.entries(item).filter(([_, v]) => v !== undefined),
        );
        return {
          ...cleanItem,
          password: await this.stringUtilServive.hash(item.password),
          createdBy: user.userEmail,
        };
      }),
    );
    return await this.extended.createMany({
      data: dataMapped,
    });
  }

  // (Kiểm tra user có phải Super Admin (quyền hệ thống cao nhất))
  async isSuperAdmin(userID: User['id']) {
    const data = await this.extended.findFirst({
      where: {
        id: userID,
        userSystemRoles: {
          some: {
            role: {
              roleType: RoleType.SUPER_ADMIN,
            },
          },
        },
      },
    });
    return data ? true : false;
  }

  // (Kiểm tra user có quyền cụ thể không)
  async isExistPermissionKey({ userID, permissionKey, vendorID }: IsExistPermissionKeyDto) {
    if (!permissionKey) return false;
    const cacheKey = `permission:${userID}:${permissionKey}:${vendorID ?? 'system'}`;
    // Check cache trước — tránh query DB mỗi request
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
    const user = await this.extended.findFirst({
      where: { id: userID },
      select: {
        userSystemRoles: {
          where: { status: 'active' },
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: { permission: { select: { key: true } } },
                },
              },
            },
          },
        },
        userVendorRoles: {
          where: { status: 'active', ...(vendorID && { vendorID }) },
          select: {
            role: {
              select: {
                rolePermissions: {
                  select: { permission: { select: { key: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!user) {
      await this.cacheManager.set(cacheKey, false, 30 * 1000);
      return false;
    }
    const allRoles = [...(user.userSystemRoles ?? []), ...(user.userVendorRoles ?? [])];
    const result = allRoles.some((item) =>
      item.role?.rolePermissions?.some((rp) => {
        const key = rp.permission?.key;
        if (!key) return false;
        const [permRoute, permAction] = key.split('_');
        const [reqRoute] = permissionKey.split('_');
        const cleanPermRoute = normalizeRoute(permRoute);
        const cleanReqRoute = normalizeRoute(reqRoute);
        if (key === permissionKey) return true;
        if (
          permAction === `[${Actions.MANAGE}]` &&
          (cleanReqRoute === cleanPermRoute || cleanReqRoute.startsWith(cleanPermRoute + '/'))
        )
          return true;
        return false;
      }),
    );
    // TTL 30 giây — ngắn vì permission có thể thay đổi bất kỳ lúc nào
    await this.cacheManager.set(cacheKey, result, 30 * 1000);
    return result;
  }

  async invalidatePermissionCache(userID?: string) {
    const pattern = userID ? `permission:${userID}:*` : 'permission:*';
    await this.cacheHelper.deleteByPattern(pattern);
  }

  async invalidateUsersCache() {
    await this.cacheHelper.deleteByPattern('users:list:*');
  }
}
