import { Module } from '@nestjs/common';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilModule } from '../../common/utils/file-util/file-util.module';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
import { ProductsModule } from '../products/products.module';
import { VendorsModule } from '../vendors/vendors.module';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { VendorProductImageController } from './vendor-product-images.controller';

@Module({
  imports: [FileUtilModule, ProductsModule, VendorsModule],
  controllers: [ProductImagesController, VendorProductImageController],
  providers: [ProductImagesService, ExcelUtilService, FileUtilService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
