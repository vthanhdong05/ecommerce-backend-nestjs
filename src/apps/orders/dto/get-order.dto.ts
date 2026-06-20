import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { Order } from '../entities/order.entity';

class GetOrdersPaginationDto extends IntersectionType(Pagination, PartialType(Order)) {}

class ExportOrdersDto {
  ids!: NonNullable<Prisma.OrderWhereUniqueInput['id']>[];
}

export { ExportOrdersDto, GetOrdersPaginationDto };
