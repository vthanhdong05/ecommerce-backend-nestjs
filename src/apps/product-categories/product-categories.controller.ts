import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ExportProductCategoriesDto } from './dto/get-product-category.dto';
import { ProductCategoriesService } from './product-categories.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Get()
  getProductCategories() {
    return this.productCategoriesService.getProductCategories();
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProductCategories(@Body() params: ExportProductCategoriesDto, @Res() res: Response) {
    const workbook = await this.productCategoriesService.exportProductCategories(params);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductCategories(@UploadedFile() file, @Req() req) {
    return this.productCategoriesService.importProductCategories({
      file,
      user: req.user,
    });
  }
}
