import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

// input để export dữ liệu theo danh sách ID
export class ExportUserSystemRolesDto {
  userIDs!: User['id'][];
  roleIDs!: Role['id'][];
}

export type UsersData = Pick<User, 'id' | 'email'>[];
export type RolesData = Pick<Role, 'id' | 'name'>[];
export type RolesImportCreate = Pick<Role, 'name'>[];
