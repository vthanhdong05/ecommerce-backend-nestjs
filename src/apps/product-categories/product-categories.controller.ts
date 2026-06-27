import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
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
  async exportProductCategories(@Query() params: ExportProductCategoriesDto, @Res() res: Response) {
    const workbook = await this.productCategoriesService.exportProductCategories(params);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductCategories(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.productCategoriesService.importProductCategories({ file, user });
  }
}
