import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, RoleType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { ImportUserSystemRolesDto } from './dto/create-user-system-role.dto';
import { ExportUserSystemRolesDto } from './dto/get-user-system-role.dto';
import { UserSystemRole } from './entities/user-system-role.entity';

@Injectable()
export class UserSystemRolesService extends PrismaBaseService<'userSystemRole'> {
  private userSystemRoleEntityName = UserSystemRole.name;
  private excelSheets = {
    [this.userSystemRoleEntityName]: this.userSystemRoleEntityName,
  };
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {
    super(prismaService, 'userSystemRole');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // Export dữ liệu User–Vendor–Role ra file Excel
  async exportUserSystemRoles(params: ExportUserSystemRolesDto) {
    const { userIDs, roleIDs } = params ?? {};
    const where: Prisma.UserSystemRoleWhereInput = {};

    if (userIDs) {
      where.userID = { in: userIDs };
    }
    if (roleIDs) {
      where.roleID = { in: roleIDs };
    }

    const userSystemRoles = await this.extended.export({
      select: {
        user: { select: { email: true } },
        role: { select: { name: true } },
      },
      where: {
        ...where,
        role: {
          roleType: { in: [RoleType.SUPER_ADMIN, RoleType.SYSTEM] },
        },
      },
    });

    const mappedData =
      userSystemRoles.length > 0
        ? userSystemRoles.map(({ user, role }) => ({
            userEmail: user?.email ?? '',
            roleName: role?.name ?? '',
          }))
        : [{ userEmail: '', roleName: '' }];

    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userSystemRoleEntityName],
          fieldsExclude: [],
          data: mappedData,
        },
      ],
    });
  }

  // Import dữ liệu từ file Excel vào database
  async importUserSystemRoles({ file, user }: ImportUserSystemRolesDto) {
    const sheetName = this.excelSheets[this.userSystemRoleEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[sheetName];
    const [allUsers, allRoles] = await Promise.all([
      this.usersService.client.findMany({ select: { id: true, email: true } }),
      this.rolesService.client.findMany({
        where: { roleType: { in: [RoleType.SUPER_ADMIN, RoleType.SYSTEM] } },
        select: { id: true, name: true },
      }),
    ]);
    const usersData = new Map(allUsers.map((u) => [u.email, u.id]));
    const rolesData = new Map(allRoles.map((r) => [r.name, r.id]));
    const idsMapping = dataImport.map((item) => {
      const { userEmail, roleName } = item ?? {};
      const userID = usersData.get(userEmail);
      if (!userID) throw new BadRequestException(`User not found with email: "${userEmail}"`);
      const roleID = rolesData.get(roleName);
      if (!roleID) throw new BadRequestException(`System role not found: "${roleName}"`);
      return { userID, roleID };
    });
    // deleteMany + createMany trong cùng 1 transaction — rollback nếu createMany lỗi
    const result = await this.prismaService.$transaction(async (tx) => {
      await tx.userSystemRole.deleteMany({ where: { OR: idsMapping } });
      return tx.userSystemRole.createMany({
        data: idsMapping.map((item) => ({
          ...item,
          createdBy: user.userEmail,
        })),
      });
    });
    // Xóa toàn bộ permission cache sau khi transaction thành công
    await this.usersService.invalidatePermissionCache();
    return result;
  }

  // Lấy danh sách mapping từ database
  async getUserSystemRoles() {
    const data = await this.extended.findMany({
      select: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const userMap = new Map<
      string,
      {
        user: any;
        roles: any[];
      }
    >();

    for (const { user, role } of data) {
      if (!userMap.has(user.id)) {
        userMap.set(user.id, {
          user,
          roles: [],
        });
      }

      userMap.get(user.id)!.roles.push(role);
    }

    return Array.from(userMap.values());
  }
}
