import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, PaginationUtilService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
