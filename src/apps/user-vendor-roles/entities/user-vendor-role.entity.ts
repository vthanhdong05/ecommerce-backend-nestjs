import { $Enums, UserVendorRole as UserVendorRolePrisma } from '@prisma/client';

export class UserVendorRole implements UserVendorRolePrisma {
  id!: string;
  userID!: string;
  vendorID!: string;
  roleID!: string;
  status!: $Enums.UserVendorRoleStatus;
  createdAt!: Date;
  createdBy!: string | null;
}
