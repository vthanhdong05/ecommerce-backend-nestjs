import { Module } from '@nestjs/common';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';
import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from 'src/common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UserProfileController } from './user-profile.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UserProfileController],
  providers: [
    UsersService,
    PaginationUtilService,
    StringUtilService,
    QueryUtilService,
    ExcelUtilService,
    StringUtilService,
    CacheHelperService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
