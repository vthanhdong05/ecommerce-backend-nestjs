import { IntersectionType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';

// Whitelist field được phép sort — chỉ những cột thật của Category (tránh Prisma throw trên field lạ)
const CATEGORY_SORTABLE_FIELDS = ['name', 'slug', 'createdAt', 'updatedAt'] as const;
type CategorySortField = (typeof CATEGORY_SORTABLE_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

class ExportCategoriesDto {
  ids!: NonNullable<Prisma.CategoryWhereUniqueInput['id']>[];
}

class GetCategoriesFilterDto {
  // Filter cơ bản
  name?: string;
  parentID?: string | null;

  // Sort server-side. `sortBy` phải nằm trong CATEGORY_SORTABLE_FIELDS.
  sortBy?: CategorySortField;
  sortOrder?: SortOrder;
}

class GetCategoriesPaginationDto extends IntersectionType(Pagination, GetCategoriesFilterDto) {}

export {
  CATEGORY_SORTABLE_FIELDS,
  ExportCategoriesDto,
  GetCategoriesFilterDto,
  GetCategoriesPaginationDto,
};
export type { CategorySortField, SortOrder };
