import { Controller, Get, Query, Res, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ExportOrderPromotionsDto } from './dto/get-order-promotion.dto';
import { OrderPromotionsService } from './order-promotions.service';
@Controller('order-promotions')
export class OrderPromotionsController {
  constructor(private readonly orderPromotionsService: OrderPromotionsService) {}

  @Get()
  getOrderPromotions(
    @Query('orderID') orderID?: string,
    @Query('promotionID') promotionID?: string,
  ) {
    return this.orderPromotionsService.getOrderPromotions({ orderID, promotionID });
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportOrderPromotions(@Query() exportDto: ExportOrderPromotionsDto, @Res() res: Response) {
    const workbook = await this.orderPromotionsService.exportOrderPromotions(exportDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }
}
