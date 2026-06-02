import { $Enums, UserSystemRole as UserSystemRolePrisma } from '@prisma/client';

export class UserSystemRole implements UserSystemRolePrisma {
  id!: string;
  userID!: string;
  roleID!: string;
  status!: $Enums.UserSystemRoleStatus;
  createdAt!: Date;
  createdBy!: string | null;
}
