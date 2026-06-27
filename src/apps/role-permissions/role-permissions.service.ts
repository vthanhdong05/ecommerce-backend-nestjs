import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { ImportRolePermissionsDto } from './dto/create-role-permission.dto';
import { RolePermission } from './entities/role-permission.entity';
import { ExportRolePermissionsDto } from './dto/get-role-permission.dto';

@Injectable()
export class RolePermissionsService extends PrismaBaseService<'rolePermission'> {
  private rolePermissionEntityName = RolePermission.name;
  private excelSheets = {
    [this.rolePermissionEntityName]: this.rolePermissionEntityName,
  };
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {
    super(prismaService, 'rolePermission');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // Export dữ liệu Role - Permission ra file Excel
  async exportRolePermissions(params: ExportRolePermissionsDto) {
    const { roleIDs, permissionIDs } = params ?? {};
    const where: Prisma.RolePermissionWhereInput = {};

    if (roleIDs) {
      where.roleID = { in: roleIDs };
    }
    if (permissionIDs) {
      where.permissionID = { in: permissionIDs };
    }

    const rolePermissions = await this.extended.export({
      select: {
        permission: {
          select: {
            name: true,
            key: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
      where,
    });
    // Tạo file excel
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.rolePermissionEntityName],
          fieldsMapping: {
            roleID: 'roleName',
            permissionID: 'permissionName',
          },
          fieldsExtend: ['permissionKey'],
          fieldsExclude: ['createdAt', 'createdBy'],
          data: rolePermissions.map(({ role, permission }) => ({
            roleName: role.name,
            permissionName: permission.name,
            permissionKey: permission.key,
          })),
        },
      ],
    });

    return data;
  }

  // 3 bước:
  // + Kiểm tra role or permission có tồn tại chưa, nếu chưa tiến hành tạo dưới database
  // + Xóa mối liên hệ giữa role và permission (Xóa data trong table RolePermission)
  // + Tạo ra mối liên hệ mới giữa trên data role và permission đã mapping
  async importRolePermissions({ file, user }: ImportRolePermissionsDto) {
    const rolePermissionSheetName = this.excelSheets[this.rolePermissionEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[rolePermissionSheetName];

    // Lấy tất cả role/permission hiện có
    const [allRoles, allPermissions] = await Promise.all([
      this.rolesService.client.findMany({ select: { id: true, name: true } }),
      this.permissionsService.client.findMany({ select: { id: true, name: true } }),
    ]);

    const roleNameMap = new Map(allRoles.map((r) => [r.name, r.id]));
    const permissionNameMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    // Throw lỗi nếu role/permission chưa tồn tại — không tự tạo mới
    const idsMapping = dataImport.map((item) => {
      const { roleName, permissionName } = item ?? {};

      const roleID = roleNameMap.get(roleName);
      if (!roleID) {
        throw new BadRequestException(`Role not found: "${roleName}". Please create it first.`);
      }

      const permissionID = permissionNameMap.get(permissionName);
      if (!permissionID) {
        throw new BadRequestException(
          `Permission not found: "${permissionName}". Please create it first.`,
        );
      }

      return { roleID, permissionID };
    });

    // deleteMany + createMany trong cùng 1 transaction
    return this.prismaService.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { OR: idsMapping } });
      return tx.rolePermission.createMany({
        data: idsMapping.map((item) => ({ ...item, createdBy: user.userEmail })),
      });
    });
  }

  // Lấy danh sách mapping từ database
  async getRolePermissions() {
    const data = await this.extended.findMany({
      select: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        permission: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
          },
        },
      },
    });
    // Group theo role
    const roleMap = new Map<string, { role: any; permissions: any[] }>();

    for (const { role, permission } of data) {
      if (!roleMap.has(role.id)) {
        roleMap.set(role.id, { role, permissions: [] });
      }
      roleMap.get(role.id)!.permissions.push(permission);
    }

    return [...roleMap.values()];
  }
}
