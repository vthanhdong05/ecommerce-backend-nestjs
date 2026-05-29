import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from 'src/common/utils/pagination-util/pagination-util.interface';
import { User } from '../entities/user.entity';

// (Dùng để xuất dữ liệu user theo danh sách ID.)
class ExportUsersDto {
  ids?: NonNullable<Prisma.UserWhereUniqueInput['id']>[];
}
class GetUsersPaginationDto extends IntersectionType(
  Pagination,
  PartialType(User), // (filter)
) {}

export { ExportUsersDto, GetUsersPaginationDto };
