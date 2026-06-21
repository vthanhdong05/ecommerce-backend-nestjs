import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Order } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import { CreateOrderDto } from './dto/create-order.dto';
import { ExportOrdersDto, GetOrdersPaginationDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createDto: CreateOrderDto, @User() user: UserInfo) {
    return this.ordersService.createOrder(createDto, user);
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getOrders(@Query() query: GetOrdersPaginationDto, @User() user: UserInfo) {
    return this.ordersService.getOrders({ ...query, userID: user.userID });
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportOrders(@Query() exportOrdersDto: ExportOrdersDto, @Res() res: Response) {
    const workbook = await this.ordersService.exportOrders(exportOrdersDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Get(':id')
  getOrder(@Param('id') id: Order['id'], @User() user: UserInfo) {
    return this.ordersService.getOrder({ id, userID: user.userID });
  }

  @Patch(':id')
  updateOrder(
    @Param('id') id: Order['id'],
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.updateOrder({ id, userID: user.userID, data: updateOrderDto });
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: Order['id'], @User() user: UserInfo) {
    return this.ordersService.cancelOrder({ id, userID: user.userID });
  }
}
