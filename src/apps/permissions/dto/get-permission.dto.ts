import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { Permission } from '../entities/permission.entity';

class GetPermissionsPaginationDto extends IntersectionType(Pagination, PartialType(Permission)) {}

class ExportPermissionsDto {
  ids: NonNullable<Prisma.PermissionWhereUniqueInput['id']>[];
}

export { GetPermissionsPaginationDto, ExportPermissionsDto };
