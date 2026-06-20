import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { Order } from '@prisma/client';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorOrderParam } from './const/vendor-order.const';
import { GetOrdersPaginationDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller(`vendors/:${VendorOrderParam.VENDOR_ID_PARAM}/orders`)
export class VendorOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getVendorOrders(
    @Param(VendorOrderParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Query() query: GetOrdersPaginationDto,
  ) {
    return this.ordersService.getVendorOrders({ ...query, vendorID: vendorId });
  }

  @Get(`:id`)
  getVendorOrder(
    @Param(VendorOrderParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param('id') id: Order['id'],
  ) {
    return this.ordersService.getVendorOrder({ id, vendorID: vendorId });
  }

  @Patch(`:id`)
  updateVendorOrder(
    @Param(VendorOrderParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param('id') id: Order['id'],
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateVendorOrder({
      id,
      vendorID: vendorId,
      data: updateOrderDto,
    });
  }
}
