import { Module } from '@nestjs/common';
import { OrderPromotionsService } from './order-promotions.service';
import { OrderPromotionsController } from './order-promotions.controller';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { OrdersModule } from '../orders/orders.module';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [ExcelUtilModule, OrdersModule, PromotionsModule],
  controllers: [OrderPromotionsController],
  providers: [OrderPromotionsService],
})
export class OrderPromotionsModule {}
