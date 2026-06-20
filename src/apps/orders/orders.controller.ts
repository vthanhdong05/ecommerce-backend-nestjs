import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UsePipes,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  Patch,
  Res,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ExportOrdersDto, GetOrdersPaginationDto } from './dto/get-order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { Order } from '@prisma/client';
import { OrdersService } from './orders.service';
import { User } from '../../common/decorators/user.decorator';
import type { UserInfo } from '../../common/decorators/user.decorator';
import type { Response } from 'express';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import type { GetOptionsParams } from '../../common/query/options.interface';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createDto: CreateOrderDto, @User() user) {
    return this.ordersService.createOrder({ ...createDto, user });
  }

  @Patch(':id')
  updateOrder(@Param('id') id: Order['id'], @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder({
      data: updateOrderDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getOrders(@Query() query: GetOrdersPaginationDto) {
    return this.ordersService.getOrders(query);
  }

  @Get('options')
  getOrderOptions(@Query() query: GetOptionsParams<Order>) {
    return this.ordersService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportOrders(@Query() exportOrdersDto: ExportOrdersDto, @Res() res: Response) {
    const workbook = await this.ordersService.exportOrders(exportOrdersDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importOrders(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.ordersService.importOrders({ file, user });
  }

  @Get(':id')
  getOrder(@Param('id') id: Order['id']) {
    return this.ordersService.getOrder({ id });
  }

  @Delete(':id')
  deleteOrder(@Param('id') id: Order['id']) {
    return this.ordersService.deleteOrder({ id });
  }
}
