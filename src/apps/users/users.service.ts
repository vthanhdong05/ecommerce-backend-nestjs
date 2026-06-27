import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import { Actions } from 'src/common/guards/access-control/access-control.const';
import { normalizeRoute } from 'src/common/utils/data-format/data-fomat.util';
import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateUserDto, ImportUsersDto } from './dto/create-user.dto';
import { ExportUsersDto, GetUsersPaginationDto, IsExistPermissionKeyDto } from './dto/get-user.dto';
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
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getUserProfile(userID: User['id']) {
    return this.extended.findUnique({
      where: { id: userID },
    });
  }

  async getUsers({ page, itemPerPage }: GetUsersPaginationDto) {
    const cacheKey = `users:list:${page}:${itemPerPage}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const totalItems = await this.extended.count();
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({ skip: paging.skip, take: itemPerPage });
    const data = paging.format(list);
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
    return data;
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: UpdateUserDto }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  async updateUserProfile(params: { userID: User['id']; data: UpdateUserDto }) {
    const { userID, data: dataUpdate } = params;
    return this.extended.update({
      where: { id: userID },
      data: dataUpdate,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    // const data = await this.extended.delete({
    //   where,
    // });
    const data = await this.extended.softDelete(where);
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
    const redisClient = (this.cacheManager.stores[0] as any).client;
    const keys: string[] = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
    }
  }

  async invalidateUsersCache() {
    const redisClient = (this.cacheManager.stores[0] as any).client;
    const keys: string[] = await redisClient.keys('users:list:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
    }
  }
}
