import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

// (input để export dữ liệu theo danh sách ID)
export class ExportUserVendorRolesDto {
  userIDs!: User['id'][];
  vendorIDs!: Vendor['id'][];
  roleIDs!: Role['id'][];
}

export type UsersData = Pick<User, 'id' | 'email'>[];

export type VendorsData = Pick<Vendor, 'id' | 'name'>[];

export type RolesData = Pick<Role, 'id' | 'name'>[];
export type RolesImportCreate = Pick<Role, 'name'>[];
