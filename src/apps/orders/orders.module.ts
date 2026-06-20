import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VendorOrdersController } from './vendor-orders.controller';

@Module({
  imports: [ExcelUtilModule],
  controllers: [OrdersController, VendorOrdersController],
  providers: [OrdersService, PaginationUtilService],
  exports: [OrdersService],
})
export class OrdersModule {}
