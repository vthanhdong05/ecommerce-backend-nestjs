import { Module } from '@nestjs/common';
import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from 'src/common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfileController } from './user-profile.controller';

@Module({
  controllers: [UsersController, UserProfileController],
  providers: [
    UsersService,
    PaginationUtilService,
    StringUtilService,
    QueryUtilService,
    ExcelUtilService,
    StringUtilService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
