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
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
    return data;
  }

  async getRoles({ page, itemPerPage, ...filters }: GetRolesPaginationDto) {
    // Build Prisma where từ filter. Search name dùng contains (case-insensitive)
    // thay vì exact match từ PartialType(Role) để user tìm "ad" ra "Admin".
    const where: Prisma.RoleWhereInput = {};
    if (filters.name && typeof filters.name === 'string') {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.roleType) {
      where.roleType = filters.roleType;
    }
    if (filters.description && typeof filters.description === 'string') {
      where.description = { contains: filters.description, mode: 'insensitive' };
    }
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
    });

    const data = paging.format(list);
    return data;
  }

  async createRole(createRoleDto: CreateRoleDto, user: UserInfo) {
    const { permissionIDs, ...roleData } = createRoleDto;
    return this.prismaService.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: { ...roleData, createdBy: user.userEmail },
      });
      if (permissionIDs?.length) {
        // Validate tất cả permissionIDs tồn tại trước khi insert (tránh FK error)
        const existingPermissions = await tx.permission.findMany({
          where: { id: { in: permissionIDs } },
          select: { id: true },
        });
        const existingIDs = new Set(existingPermissions.map((p) => p.id));
        const invalidIDs = permissionIDs.filter((id) => !existingIDs.has(id));
        if (invalidIDs.length) {
          throw new BadRequestException(`Invalid permission IDs: ${invalidIDs.join(', ')}`);
        }
        await tx.rolePermission.createMany({
          data: permissionIDs.map((permissionID) => ({
            roleID: role.id,
            permissionID,
            createdBy: user.userEmail,
          })),
        });
      }
      // Trả về role kèm permissions để FE có thể dùng luôn
      return tx.role.findUnique({
        where: { id: role.id },
        include: { rolePermissions: { include: { permission: true } } },
      });
    });
  }

  async updateRole(params: {
    where: Prisma.RoleWhereUniqueInput;
    data: UpdateRoleDto;
    user: UserInfo;
  }) {
    const { where, data: dataUpdate, user } = params;
    const { permissionIDs, ...roleData } = dataUpdate;
    return this.prismaService.$transaction(async (tx) => {
      const role = await tx.role.update({
        data: roleData,
        where,
      });
      // Nếu truyền permissionIDs → thay thế toàn bộ (xóa cũ + thêm mới)
      // Nếu không truyền → giữ nguyên
      if (permissionIDs !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleID: role.id } });
        if (permissionIDs.length) {
          const existingPermissions = await tx.permission.findMany({
            where: { id: { in: permissionIDs } },
            select: { id: true },
          });
          const existingIDs = new Set(existingPermissions.map((p) => p.id));
          const invalidIDs = permissionIDs.filter((id) => !existingIDs.has(id));
          if (invalidIDs.length) {
            throw new BadRequestException(`Invalid permission IDs: ${invalidIDs.join(', ')}`);
          }
          await tx.rolePermission.createMany({
            data: permissionIDs.map((permissionID) => ({
              roleID: role.id,
              permissionID,
              createdBy: user.userEmail,
            })),
          });
        }
      }
      return tx.role.findUnique({
        where: { id: role.id },
        include: { rolePermissions: { include: { permission: true } } },
      });
    });
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
