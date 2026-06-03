import { Module } from '@nestjs/common';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { UsersService } from '../users/users.service';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorProfileController } from './vendor-profile.controller';

@Module({
  imports: [ExcelUtilModule],
  controllers: [VendorsController, VendorProfileController],
  providers: [VendorsService, PaginationUtilService, UsersService, StringUtilService],
  exports: [VendorsService],
})
export class VendorsModule {}
