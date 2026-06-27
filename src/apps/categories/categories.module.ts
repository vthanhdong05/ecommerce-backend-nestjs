import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, PaginationUtilService, CacheHelperService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
