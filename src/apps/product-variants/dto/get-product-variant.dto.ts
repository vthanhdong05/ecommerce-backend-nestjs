import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { ProductVariant } from '../entities/product-variant.entity';

class GetProductVariantsPaginationDto extends IntersectionType(
  Pagination,
  PartialType(ProductVariant),
) {}

class ExportProductVariantsDto {
  ids!: NonNullable<Prisma.ProductVariantWhereUniqueInput['id']>[];
}

export { ExportProductVariantsDto, GetProductVariantsPaginationDto };
