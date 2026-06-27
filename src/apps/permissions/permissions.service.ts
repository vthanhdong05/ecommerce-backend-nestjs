import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreatePermissionDto, ImportPermissionsDto } from './dto/create-permission.dto';
import { ExportPermissionsDto, GetPermissionsPaginationDto } from './dto/get-permission.dto';
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

  async getPermissions({ page, itemPerPage }: GetPermissionsPaginationDto) {
    const totalItems = await this.extended.count();
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      skip: paging.skip,
      take: itemPerPage,
    });

    const data = paging.format(list);
    return data;
  }

  async createPermission(createPermissionDto: CreatePermissionDto, user: UserInfo) {
    const data = await this.extended.create({
      data: {
        ...createPermissionDto,
        user,
      } as any,
    });
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
    return this.extended.softDelete(where);
  }
}
