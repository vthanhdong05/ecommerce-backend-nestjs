import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { Role } from '../entities/role.entity';

// IntersectionType: Gộp 2 class
class GetRolesPaginationDto extends IntersectionType(Pagination, PartialType(Role)) {}

class ExportRolesDto {
  ids!: NonNullable<Prisma.RoleWhereUniqueInput['id']>[]; // NonNullable: loại bỏ null | undefined
}

export { ExportRolesDto, GetRolesPaginationDto };
