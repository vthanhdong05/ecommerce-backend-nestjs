import { IntersectionType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';

// Whitelist field được phép sort — chỉ những cột thật của Permission.
// Mọi string khác sẽ bị bỏ qua để Prisma không throw.
const PERMISSION_SORTABLE_FIELDS = [
  'name',
  'key',
  'isSystemPermission',
  'createdAt',
  'updatedAt',
] as const;
type PermissionSortField = (typeof PERMISSION_SORTABLE_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

class GetPermissionsFilterDto {
  // Filter fields — khai báo tường minh vì `PartialType(Permission)` không chạy runtime
  // validation trong class này (Permission entity không có zod schema truyền vào).
  // Service sẽ map từng field sang Prisma where với mode: 'insensitive' cho substring search.
  name?: string;
  key?: string;
  description?: string;
  // Lưu ý: `isSystemPermission` đến từ query string nên là string `'true' | 'false'`
  // (project dùng `ZodValidationPipe`, không chạy class-transformer).
  // Service sẽ ép kiểu string → boolean trước khi build Prisma where.
  isSystemPermission?: boolean | string;

  // Sort server-side. `sortBy` phải nằm trong PERMISSION_SORTABLE_FIELDS.
  sortBy?: PermissionSortField;
  sortOrder?: SortOrder;
}

class GetPermissionsPaginationDto extends IntersectionType(Pagination, GetPermissionsFilterDto) {}

class ExportPermissionsDto {
  ids!: NonNullable<Prisma.PermissionWhereUniqueInput['id']>[];
}

export { ExportPermissionsDto, GetPermissionsPaginationDto, PERMISSION_SORTABLE_FIELDS };
export type { PermissionSortField, SortOrder };
