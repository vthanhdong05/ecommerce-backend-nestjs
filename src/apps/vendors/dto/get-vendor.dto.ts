import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { Vendor } from '../entities/vendor.entity';

class GetVendorsPaginationDto extends IntersectionType(Pagination, PartialType(Vendor)) {}

class ExportVendorsDto {
  ids!: NonNullable<Prisma.VendorWhereUniqueInput['id']>[];
}

export { ExportVendorsDto, GetVendorsPaginationDto };
