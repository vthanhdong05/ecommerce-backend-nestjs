import { Permission } from '@prisma/client';
import { Role } from '../../roles/entities/role.entity';

// input để export dữ liệu theo danh sách ID
export class ExportRolePermissionsDto {
  roleIDs!: Role['id'][];
  permissionIDs!: Permission['id'][];
}

export type RolesData = Pick<Role, 'id' | 'name'>[];
export type RolesImportCreate = Pick<Role, 'name'>[];

export type PermissionsData = Pick<Permission, 'id' | 'name'>[];
export type PermissionsImportCreate = Pick<Permission, 'name' | 'key'>[];
