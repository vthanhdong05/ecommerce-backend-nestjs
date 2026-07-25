import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Prisma } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreatePermissionDto, ImportPermissionsDto } from './dto/create-permission.dto';
import {
  ExportPermissionsDto,
  GetPermissionsPaginationDto,
  PERMISSION_SORTABLE_FIELDS,
} from './dto/get-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService
  extends PrismaBaseService<'permission'>
  implements Options<Permission>
{
  private permissionEntityName = Permission.name;
  private excelSheets = {
    [this.permissionEntityName]: this.permissionEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cacheHelper: CacheHelperService,
  ) {
    super(prismaService, 'permission');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getPermission(where: Prisma.PermissionWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getPermissions({ page, itemPerPage, ...filters }: GetPermissionsPaginationDto) {
    // Cache key bao gồm cả filter để tránh cache sai giữa các filter khác nhau
    const filterKey = JSON.stringify(filters);
    const cacheKey = `permissions:list:${page}:${itemPerPage}:${filterKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    // Build Prisma where từ filter. `PartialType(Permission)` đã validate whitelist field ở DTO,
    // nhưng ta vẫn dùng `contains` + `mode: 'insensitive'` cho `name`/`key`/`description`
    // để search UX giống users (case-insensitive substring).
    const where: Prisma.PermissionWhereInput = {};
    if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
    if (filters.key) where.key = { contains: filters.key, mode: 'insensitive' };
    if (filters.description) where.description = { contains: filters.description };
    // `isSystemPermission` đến từ query string nên là string `'true' | 'false'` (ZodValidationPipe
    // không chạy class-transformer). Ép kiểu tường minh để Prisma so sánh boolean đúng.
    // '1' / '' / 'false' / '0' → false; 'true' → true; các giá trị khác → bỏ qua filter.
    if (filters.isSystemPermission !== undefined) {
      const v = filters.isSystemPermission;
      if (v === true || v === false) {
        where.isSystemPermission = v;
      } else if (typeof v === 'string') {
        if (v === 'true') where.isSystemPermission = true;
        else if (v === 'false' || v === '0' || v === '') where.isSystemPermission = false;
      }
    }
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    // Build orderBy an toàn — whitelist field để tránh Prisma throw trên field lạ.
    // Luôn tie-break bằng id desc để page boundary ổn định khi nhiều row có cùng giá trị sort.
    const sortBy = (filters.sortBy as string | undefined) ?? 'createdAt';
    const sortOrder: 'asc' | 'desc' = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    const safeSortBy = (PERMISSION_SORTABLE_FIELDS as readonly string[]).includes(sortBy)
      ? sortBy
      : 'createdAt';
    const orderBy: Prisma.PermissionOrderByWithRelationInput[] = [
      { [safeSortBy]: sortOrder },
      { id: 'desc' },
    ];
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      orderBy,
    });

    const data = paging.format(list);
    // TTL 60 giây
    await this.cacheManager.set(cacheKey, data, 60 * 1000);
    return data;
  }

  async invalidatePermissionsCache() {
    await this.cacheHelper.deleteByPattern('permissions:list:*');
  }

  async createPermission(createPermissionDto: CreatePermissionDto, user: UserInfo) {
    const data = await this.extended.create({
      data: {
        ...createPermissionDto,
        user,
      } as any,
    });
    await this.invalidatePermissionsCache();
    return data;
  }

  async updatePermission(params: {
    where: Prisma.PermissionWhereUniqueInput;
    data: UpdatePermissionDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    await this.invalidatePermissionsCache();
    return data;
  }

  async getOptions(params: GetOptionsParams<Permission>) {
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

  async exportPermissions({ ids }: ExportPermissionsDto) {
    const permissions = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });

    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.permissionEntityName],
          data: permissions,
        },
      ],
    });

    return data;
  }

  async importPermissions({ file, user }: ImportPermissionsDto) {
    const permissionSheetName = this.excelSheets[this.permissionEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const data = await this.extended.createMany({
      data: dataCreated[permissionSheetName].map((item) => ({
        ...item,
        user,
      })),
    });
    await this.invalidatePermissionsCache();
    return data;
  }

  async deletePermission(where: Prisma.PermissionWhereUniqueInput) {
    const inUse = await this.prismaService.rolePermission.findFirst({
      where: { permissionID: where.id as string },
    });
    if (inUse) {
      throw new BadRequestException(
        'Cannot delete a permission assigned to a role. Remove it from all roles first.',
      );
    }
    const data = await this.extended.softDelete(where);
    await this.invalidatePermissionsCache();
    return data;
  }
}
