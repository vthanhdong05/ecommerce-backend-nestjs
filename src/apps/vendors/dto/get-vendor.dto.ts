import { IntersectionType } from '@nestjs/mapped-types';
import { Prisma, VendorStatus } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';

class ExportVendorsDto {
  ids!: NonNullable<Prisma.VendorWhereUniqueInput['id']>[];
}

// Whitelist field được phép sort — chỉ những cột thật của Vendor (tránh Prisma throw trên field lạ)
const VENDOR_SORTABLE_FIELDS = [
  'name',
  'status',
  'totalProducts',
  'totalOrders',
  'createdAt',
  'updatedAt',
] as const;
type VendorSortField = (typeof VENDOR_SORTABLE_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

class GetVendorsFilterDto {
  // Filter cơ bản (PartialType-like nhưng chỉ các field an toàn)
  name?: string;
  status?: VendorStatus;

  // Sort server-side. `sortBy` phải nằm trong VENDOR_SORTABLE_FIELDS.
  sortBy?: VendorSortField;
  sortOrder?: SortOrder;
}

class GetVendorsPaginationDto extends IntersectionType(Pagination, GetVendorsFilterDto) {}

export { ExportVendorsDto, GetVendorsFilterDto, GetVendorsPaginationDto, VENDOR_SORTABLE_FIELDS };
export type { SortOrder, VendorSortField };
