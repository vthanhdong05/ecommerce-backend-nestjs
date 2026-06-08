import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [ExcelUtilModule, ProductsModule, CategoriesModule, VendorsModule],
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
