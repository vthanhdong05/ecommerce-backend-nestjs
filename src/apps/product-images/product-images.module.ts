import { Module } from '@nestjs/common';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilModule } from '../../common/utils/file-util/file-util.module';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [FileUtilModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService, ExcelUtilService, FileUtilService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
