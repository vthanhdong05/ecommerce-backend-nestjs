import { Module } from '@nestjs/common';
import { PaginationUtilService } from 'src/common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PaginationUtilService, StringUtilService, QueryUtilService],
  exports: [UsersService],
})
export class UsersModule {}
