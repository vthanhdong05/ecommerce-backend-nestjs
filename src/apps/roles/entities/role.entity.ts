import { $Enums, Role as RolePrisma } from '@prisma/client';

export class Role implements RolePrisma {
  name!: string;
  id!: string;
  description!: string | null;
  roleType!: $Enums.RoleType;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
