import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateRoleDto, ImportRolesDto } from './dto/create-role.dto';
import { ExportRolesDto, GetRolesPaginationDto } from './dto/get-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService extends PrismaBaseService<'role'> implements Options<Role> {
  private roleEntityName = Role.name;
  private excelSheets = {
    [this.roleEntityName]: this.roleEntityName, // (key động)
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'role');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // Lấy 1 record Role dựa trên field có tính unique
  async getRole(where: Prisma.RoleWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getRoles({ page, itemPerPage }: GetRolesPaginationDto) {
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

  async createRole(createRoleDto: CreateRoleDto, user: UserInfo) {
    return this.extended.create({
      data: { ...createRoleDto, user } as any,
    });
  }

  async updateRole(params: { where: Prisma.RoleWhereUniqueInput; data: UpdateRoleDto }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  async getOptions(params: GetOptionsParams<Role>) {
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

  async exportRoles({ ids }: ExportRolesDto) {
    const roles = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });
    // Tạo file Excel
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.roleEntityName],
          data: roles,
        },
      ],
    });

    return data;
  }

  async importRoles({ file, user }: ImportRolesDto) {
    const roleSheetName = this.excelSheets[this.roleEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const data = await this.extended.createMany({
      data: dataCreated[roleSheetName].map((item) => ({
        ...item,
        user,
      })),
    });
    return data;
  }

  async deleteRole(where: Prisma.RoleWhereUniqueInput) {
    const [rolePermission, userSystemRole, userVendorRole] = await Promise.all([
      this.prismaService.rolePermission.findFirst({ where: { roleID: where.id as string } }),
      this.prismaService.userSystemRole.findFirst({ where: { roleID: where.id as string } }),
      this.prismaService.userVendorRole.findFirst({ where: { roleID: where.id as string } }),
    ]);

    if (rolePermission) {
      throw new BadRequestException(
        'Cannot delete a role that has permissions assigned. Remove all permissions first.',
      );
    }
    if (userSystemRole || userVendorRole) {
      throw new BadRequestException(
        'Cannot delete a role that is assigned to users. Remove all user assignments first.',
      );
    }

    return this.extended.softDelete(where);
  }
}
