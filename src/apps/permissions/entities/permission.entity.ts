import { Permission as PermissionPrisma } from '@prisma/client';

export class Permission implements PermissionPrisma {
  name!: string;
  id!: string;
  description!: string | null;
  key!: string;
  isSystemPermission!: boolean;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
