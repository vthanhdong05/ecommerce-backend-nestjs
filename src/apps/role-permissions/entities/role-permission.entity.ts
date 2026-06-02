import { RolePermission as RolePermissionPrisma } from '@prisma/client';

export class RolePermission implements RolePermissionPrisma {
  roleID!: string;
  permissionID!: string;
  createdAt!: Date;
  createdBy!: string | null;
}
