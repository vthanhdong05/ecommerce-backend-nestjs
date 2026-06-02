import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, RoleType, UserVendorRoleStatus } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorsService } from '../vendors/vendors.service';
import { ImportUserVendorRolesDto } from './dto/create-user-vendor-role.dto';
import { ExportUserVendorRolesDto } from './dto/get-user-vendor-role.dto';
import { UserVendorRole } from './entities/user-vendor-role.entity';

@Injectable()
export class UserVendorRolesService extends PrismaBaseService<'userVendorRole'> {
  private userVendorRoleEntityName = UserVendorRole.name;
  private excelSheets = {
    [this.userVendorRoleEntityName]: this.userVendorRoleEntityName,
  };
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
    private usersService: UsersService,
    private rolesService: RolesService,
    private vendorsService: VendorsService,
  ) {
    super(prismaService, 'userVendorRole');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (Export dữ liệu User–Vendor–Role ra file Excel)
  async exportUserVendorRoles(params: ExportUserVendorRolesDto) {
    const { userIDs, roleIDs, vendorIDs } = params ?? {};
    const where: Prisma.UserVendorRoleWhereInput = {};

    if (userIDs) {
      where.userID = { in: userIDs };
    }
    if (vendorIDs) {
      where.vendorID = { in: vendorIDs };
    }
    if (roleIDs) {
      where.roleID = { in: roleIDs };
    }

    const userVendorRoles = await this.extended.export({
      select: {
        user: { select: { email: true } },
        vendor: { select: { name: true } },
        role: { select: { name: true } },
      },
      where,
    });

    const mappedData =
      userVendorRoles.length > 0
        ? userVendorRoles.map(({ user, vendor, role }) => ({
            userEmail: user.email,
            vendorName: vendor.name,
            roleName: role.name,
          }))
        : [{ userEmail: '', vendorName: '', roleName: '' }];

    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userVendorRoleEntityName],
          fieldsExclude: [],
          data: mappedData,
        },
      ],
    });

    return data;
  }

  // (Import dữ liệu từ file Excel vào database)
  async importUserVendorRoles({ file, user }: ImportUserVendorRolesDto) {
    const userVendorRoleSheetName = this.excelSheets[this.userVendorRoleEntityName];

    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[userVendorRoleSheetName];

    const [allUsers, allVendors, allRoles] = await Promise.all([
      this.usersService.client.findMany({ select: { id: true, email: true } }),
      this.vendorsService.client.findMany({ select: { id: true, name: true } }),
      this.rolesService.client.findMany({ select: { id: true, name: true } }),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.email, u.id])); // email   → userID
    const vendorMap = new Map(allVendors.map((v) => [v.name, v.id])); // name    → vendorID
    const roleMap = new Map(allRoles.map((r) => [r.name, r.id])); // roleName → roleID

    const idsMapping = dataImport.map((item) => {
      const { userEmail, vendorName, roleName } = item ?? {};

      const userID = userMap.get(userEmail);
      if (!userID) {
        throw new BadRequestException(`User không tồn tại: "${userEmail}"`);
      }

      const vendorID = vendorMap.get(vendorName);
      if (!vendorID) {
        throw new BadRequestException(`Vendor không tồn tại: "${vendorName}"`);
      }

      const roleID = roleMap.get(roleName);
      if (!roleID) {
        throw new BadRequestException(`Role không tồn tại: "${roleName}"`);
      }

      return { userID, vendorID, roleID };
    });

    return this.prismaService.$transaction(async (tx) => {
      await tx.userVendorRole.deleteMany({ where: { OR: idsMapping } });

      return tx.userVendorRole.createMany({
        data: idsMapping.map((item) => ({
          ...item,
          createdBy: user.userID,
        })),
      });
    });
  }

  // (Lấy danh sách mapping từ database)
  async getUserVendorRoles() {
    const data = await this.extended.findMany({
      select: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            description: true,
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
    // (Map để gom nhóm theo vendor)
    const vendorMap = new Map<string, { vendor: any; members: any[] }>();
    for (const { vendor, user, role } of data) {
      if (!vendorMap.has(vendor.id)) {
        vendorMap.set(vendor.id, { vendor, members: [] }); // (check vendor nếu chưa có -> tạo mới)
      }
      vendorMap.get(vendor.id)!.members.push({ user, role }); // (Thêm user+role vào vendor)
    }
    return [...vendorMap.values()];
  }

  // (Lấy danh sách members của vendor)
  async getMembers(vendorID: Vendor['id']) {
    const data = await this.extended.findMany({
      where: { vendorID },
      select: {
        id: true,
        status: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        role: { select: { id: true, name: true } },
      },
    });
    return data;
  }

  // (Thêm thành viên vào vendor)
  async addMember({
    vendorID,
    userID,
    roleID,
    user,
  }: {
    vendorID: Vendor['id'];
    userID: User['id'];
    roleID: Role['id'];
    user: UserInfo;
  }) {
    // Check user tồn tại
    const existUser = await this.usersService.client.findUnique({
      where: { id: userID },
    });
    if (!existUser) throw new BadRequestException(`User not found`);
    // Check role phải là VENDOR type
    const role = await this.rolesService.client.findFirst({
      where: { id: roleID, roleType: RoleType.VENDOR },
    });
    if (!role) throw new BadRequestException(`Invalid role or not a VENDOR role`);
    return this.extended.create({
      data: { userID, vendorID, roleID, createdBy: user.userEmail },
    });
  }

  async updateMember({
    id,
    roleID,
    status,
  }: {
    id: string;
    roleID?: Role['id'];
    status?: UserVendorRoleStatus;
    user: UserInfo;
  }) {
    // Nếu đổi role → check role phải là VENDOR type
    if (roleID) {
      const role = await this.rolesService.client.findFirst({
        where: { id: roleID, roleType: RoleType.VENDOR },
      });
      if (!role) throw new BadRequestException(`Role không hợp lệ hoặc không phải VENDOR role`);
    }
    return this.extended.update({
      where: { id },
      data: {
        ...(roleID && { roleID }),
        ...(status && { status }),
      },
    });
  }

  async removeMember(id: string) {
    return await this.extended.delete({
      where: { id },
    });
  }

  // (export members)
  async exportMembers(vendorID: string) {
    const userVendorRoles = await this.extended.export({
      where: { vendorID },
      select: {
        user: { select: { email: true } },
        role: { select: { name: true } },
      },
    });
    const mappedData = userVendorRoles.map(({ user, role }) => ({
      userEmail: user.email,
      roleName: role.name,
    }));
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userVendorRoleEntityName],
          data: mappedData,
        },
      ],
    });
  }

  // (import members)
  async importMembers({
    vendorID,
    file,
    user,
  }: {
    vendorID: Vendor['id'];
    file: Express.Multer.File;
    user: UserInfo;
  }) {
    const sheetName = this.excelSheets[this.userVendorRoleEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const rows = dataCreated[sheetName];
    const [allUsers, allRoles] = await Promise.all([
      this.usersService.client.findMany({ select: { id: true, email: true } }),
      this.rolesService.client.findMany({
        where: { roleType: RoleType.VENDOR },
        select: { id: true, name: true },
      }),
    ]);
    const userMap = new Map(allUsers.map((u) => [u.email, u.id]));
    const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));
    const data = rows.map(({ userEmail, roleName }) => {
      const userID = userMap.get(userEmail);
      if (!userID) throw new BadRequestException(`User not found: "${userEmail}"`);

      const roleID = roleMap.get(roleName);
      if (!roleID)
        throw new BadRequestException(
          `The role does not exist or is not a VENDOR role.: "${roleName}"`,
        );

      return { userID, vendorID, roleID, createdBy: user.userID };
    });
    return this.prismaService.$transaction(async (tx) => {
      await tx.userVendorRole.deleteMany({
        where: { vendorID, userID: { in: data.map((d) => d.userID) } },
      });
      return tx.userVendorRole.createMany({ data });
    });
  }
}
