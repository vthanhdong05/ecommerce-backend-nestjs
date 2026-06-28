import { Module } from '@nestjs/common';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { UsersService } from '../users/users.service';
import { VendorProfileController } from './vendor-profile.controller';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorShopController } from './vendor-shop.controller';

@Module({
  imports: [ExcelUtilModule],
  controllers: [VendorsController, VendorProfileController, VendorShopController],
  providers: [
    VendorsService,
    PaginationUtilService,
    UsersService,
    StringUtilService,
    CacheHelperService,
  ],
  exports: [VendorsService],
})
export class VendorsModule {}
