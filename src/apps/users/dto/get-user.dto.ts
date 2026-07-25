import { IntersectionType } from '@nestjs/mapped-types';
import { Prisma, RoleType, UserStatus, Vendor } from '@prisma/client';
import { Pagination } from 'src/common/utils/pagination-util/pagination-util.interface';
import { User } from '../entities/user.entity';

// (Dùng để xuất dữ liệu user theo danh sách ID.)
class ExportUsersDto {
  ids?: NonNullable<Prisma.UserWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  userID?: User['id'];
  permissionKey?: string;
  vendorID?: Vendor['id'];
}

// Mở rộng RoleType thêm 'USER' để filter user không có role hệ thống/vendor nào
type RoleTypeFilter = RoleType | 'USER';

// Whitelist field được phép sort — chỉ những cột thật của User.
// Mọi string khác sẽ bị bỏ qua để Prisma không throw.
const USER_SORTABLE_FIELDS = ['email', 'firstName', 'lastName', 'createdAt', 'updatedAt'] as const;
type UserSortField = (typeof USER_SORTABLE_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

class GetUsersFilterDto {
  // Filter cơ bản từ User
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: UserStatus;

  // Filter theo roleType — 'USER' = user không có role active nào
  roleType?: RoleTypeFilter;

  // Sort server-side. `sortBy` phải nằm trong USER_SORTABLE_FIELDS.
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}

class GetUsersPaginationDto extends IntersectionType(Pagination, GetUsersFilterDto) {}

export {
  ExportUsersDto,
  GetUsersFilterDto,
  GetUsersPaginationDto,
  IsExistPermissionKeyDto,
  USER_SORTABLE_FIELDS,
};
export type { RoleTypeFilter, SortOrder, UserSortField };
