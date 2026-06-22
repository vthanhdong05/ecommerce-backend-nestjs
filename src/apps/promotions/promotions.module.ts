import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [PromotionsController],
  providers: [PromotionsService, PaginationUtilService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
