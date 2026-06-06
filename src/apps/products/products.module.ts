import { Module } from '@nestjs/common';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { VendorProductsController } from './vendor-product.controller';

@Module({
  imports: [ExcelUtilModule],
  controllers: [ProductsController, VendorProductsController],
  providers: [
    ProductsService,
    PaginationUtilService,
    VendorsService,
    UsersService,
    StringUtilService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
