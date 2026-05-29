import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Pagination } from 'src/common/utils/pagination-util/pagination-util.interface';
import { User } from '../entities/user.entity';

export class GetUsersPaginationDto extends IntersectionType(Pagination, PartialType(User)) {}
