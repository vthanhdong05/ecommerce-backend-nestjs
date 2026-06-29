import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async exportUserVendorRoles(params: ExportUserVendorRolesDto) {
    const { userIDs, roleIDs, vendorIDs } = params ?? {};
    const where: Prisma.UserVendorRoleWhereInput = {};

    if (userIDs) where.userID = { in: userIDs };
    if (vendorIDs) where.vendorID = { in: vendorIDs };
    if (roleIDs) where.roleID = { in: roleIDs };

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

    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userVendorRoleEntityName],
          fieldsExclude: [],
          data: mappedData,
        },
      ],
    });
  }

  async importUserVendorRoles({ file, user }: ImportUserVendorRolesDto) {
    const userVendorRoleSheetName = this.excelSheets[this.userVendorRoleEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[userVendorRoleSheetName];

    const [allUsers, allVendors, allRoles] = await Promise.all([
      this.usersService.client.findMany({ select: { id: true, email: true } }),
      this.vendorsService.client.findMany({ select: { id: true, name: true } }),
      this.rolesService.client.findMany({ select: { id: true, name: true } }),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.email, u.id]));
    const vendorMap = new Map(allVendors.map((v) => [v.name, v.id]));
    const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));

    for (const { userEmail, vendorName, roleName } of dataImport) {
      if (!userMap.has(userEmail))
        throw new BadRequestException(`User không tồn tại: "${userEmail}"`);
      if (!vendorMap.has(vendorName))
        throw new BadRequestException(`Vendor không tồn tại: "${vendorName}"`);
      if (!roleMap.has(roleName))
        throw new BadRequestException(`Role không tồn tại: "${roleName}"`);
    }

    const idsMapping = dataImport.map(({ userEmail, vendorName, roleName }) => ({
      userID: userMap.get(userEmail)!,
      vendorID: vendorMap.get(vendorName)!,
      roleID: roleMap.get(roleName)!,
    }));

    return this.prismaService.$transaction(async (tx) => {
      await tx.userVendorRole.deleteMany({ where: { OR: idsMapping } });
      return tx.userVendorRole.createMany({
        data: idsMapping.map((item) => ({ ...item, createdBy: user.userID })),
      });
    });
  }

  async getUserVendorRoles() {
    const data = await this.extended.findMany({
      select: {
        user: { select: { id: true, email: true } },
        vendor: { select: { id: true, name: true, description: true } },
        role: { select: { id: true, name: true, description: true } },
      },
    });

    const vendorMap = new Map<string, { vendor: any; members: any[] }>();
    for (const { vendor, user, role } of data) {
      if (!vendorMap.has(vendor.id)) {
        vendorMap.set(vendor.id, { vendor, members: [] });
      }
      vendorMap.get(vendor.id)!.members.push({ user, role });
    }
    return [...vendorMap.values()];
  }

  async getMembers(vendorID: Vendor['id']) {
    return this.extended.findMany({
      where: { vendorID },
      select: {
        id: true,
        status: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        role: { select: { id: true, name: true } },
      },
    });
  }

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
    const existUser = await this.usersService.client.findUnique({ where: { id: userID } });
    if (!existUser) throw new BadRequestException(`User not found`);

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
    vendorID,
    roleID,
    status,
  }: {
    id: string;
    vendorID: Vendor['id'];
    roleID?: Role['id'];
    status?: UserVendorRoleStatus;
    user: UserInfo;
  }) {
    const member = await this.extended.findFirst({ where: { id, vendorID } });
    if (!member) throw new NotFoundException('Member not found');

    if (roleID) {
      const role = await this.rolesService.client.findFirst({
        where: { id: roleID, roleType: RoleType.VENDOR },
      });
      if (!role) throw new BadRequestException('Invalid role or not a VENDOR role');
    }

    return this.extended.update({
      where: { id },
      data: {
        ...(roleID && { roleID }),
        ...(status && { status }),
      },
    });
  }

  async removeMember(id: string, vendorID: string, requestingUserID: string) {
    const member = await this.extended.findFirst({
      where: { id, vendorID },
      include: { vendor: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (member.vendor.userID === requestingUserID && member.userID === requestingUserID) {
      throw new BadRequestException('Owner cannot remove themselves from the vendor');
    }

    return this.extended.delete({ where: { id } });
  }

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

    for (const { userEmail, roleName } of rows) {
      if (!userMap.has(userEmail)) throw new BadRequestException(`User not found: "${userEmail}"`);
      if (!roleMap.has(roleName))
        throw new BadRequestException(
          `The role does not exist or is not a VENDOR role: "${roleName}"`,
        );
    }

    const data = rows.map(({ userEmail, roleName }) => ({
      userID: userMap.get(userEmail)!,
      vendorID,
      roleID: roleMap.get(roleName)!,
      createdBy: user.userID,
    }));

    return this.prismaService.$transaction(async (tx) => {
      await tx.userVendorRole.deleteMany({
        where: { vendorID, userID: { in: data.map((d) => d.userID) } },
      });
      return tx.userVendorRole.createMany({ data });
    });
  }
}
