import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Promotion } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ExportPromotionsDto, GetPromotionsPaginationDto } from './dto/get-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  createPromotion(@Body() createDto: CreatePromotionDto, @User() user: UserInfo) {
    return this.promotionsService.createPromotion(createDto, user);
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getPromotions(@Query() query: GetPromotionsPaginationDto) {
    return this.promotionsService.getPromotions(query);
  }

  @Get('options')
  getPromotionOptions(@Query() query: GetOptionsParams<Promotion>) {
    return this.promotionsService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportPromotions(@Query() exportPromotionsDto: ExportPromotionsDto, @Res() res: Response) {
    const workbook = await this.promotionsService.exportPromotions(exportPromotionsDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Get(':id')
  getPromotion(@Param('id') id: Promotion['id']) {
    return this.promotionsService.getPromotion({ id });
  }

  @Patch(':id')
  updatePromotion(
    @Param('id') id: Promotion['id'],
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.updatePromotion({
      data: updatePromotionDto,
      where: { id },
    });
  }

  @Patch('deactivate:/id')
  deactivatePromotion(@Param('id') id: Promotion['id']) {
    return this.promotionsService.deactivatePromotion({ id });
  }

  @Delete(':id')
  deletePromotion(@Param('id') id: Promotion['id']) {
    return this.promotionsService.deletePromotion({ id });
  }
}
