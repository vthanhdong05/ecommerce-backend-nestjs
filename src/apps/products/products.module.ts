import { Module } from '@nestjs/common';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { UsersService } from '../users/users.service';
import { VendorsModule } from '../vendors/vendors.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { VendorProductsController } from './vendor-product.controller';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';

@Module({
  imports: [ExcelUtilModule, VendorsModule],
  controllers: [ProductsController, VendorProductsController],
  providers: [
    ProductsService,
    PaginationUtilService,
    UsersService,
    StringUtilService,
    CacheHelperService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
