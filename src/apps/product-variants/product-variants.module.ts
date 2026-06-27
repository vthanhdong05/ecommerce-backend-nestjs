import { Module } from '@nestjs/common';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { VendorsModule } from '../vendors/vendors.module';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { VendorProductVariantsController } from './vendor-product-variants.controller';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';

@Module({
  imports: [ExcelUtilModule, VendorsModule],
  controllers: [ProductVariantsController, VendorProductVariantsController],
  providers: [
    ProductVariantsService,
    PaginationUtilService,
    ProductsService,
    UsersService,
    StringUtilService,
    CacheHelperService,
  ],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
