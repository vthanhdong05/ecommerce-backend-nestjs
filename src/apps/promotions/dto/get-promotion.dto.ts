import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { Promotion } from '../entities/promotion.entity';

class GetPromotionsPaginationDto extends IntersectionType(Pagination, PartialType(Promotion)) {}

class ExportPromotionsDto {
  ids!: NonNullable<Prisma.PromotionWhereUniqueInput['id']>[];
}

export { ExportPromotionsDto, GetPromotionsPaginationDto };
