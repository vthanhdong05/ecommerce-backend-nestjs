import { Module } from '@nestjs/common';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { OrderAddressesService } from '../order-addresses/order-addresses.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VendorOrdersController } from './vendor-orders.controller';
import { OrderPromotionsService } from '../order-promotions/order-promotions.service';
import { PromotionsService } from '../promotions/promotions.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [OrdersController, VendorOrdersController],
  providers: [
    OrdersService,
    PaginationUtilService,
    StringUtilService,
    OrderItemsService,
    OrderAddressesService,
    PromotionsService,
    OrderPromotionsService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
