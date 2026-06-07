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
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductVariant } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import {
  ExportProductVariantsDto,
  GetProductVariantsPaginationDto,
} from './dto/get-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantsService } from './product-variants.service';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  createProductVariant(@Body() createDto: CreateProductVariantDto, @User() user: UserInfo) {
    return this.productVariantsService.createProductVariant(createDto, user);
  }

  @Patch(':id')
  updateProductVariant(
    @Param('id') id: ProductVariant['id'],
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.updateProductVariant({
      data: updateProductVariantDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getProductVariants(@Query() query: GetProductVariantsPaginationDto) {
    return this.productVariantsService.getProductVariants(query);
  }

  @Get('options')
  getProductVariantOptions(@Query() query: GetOptionsParams<ProductVariant>) {
    return this.productVariantsService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProductVariants(
    @Query() exportProductVariantsDto: ExportProductVariantsDto,
    @Res() res: Response,
  ) {
    const workbook =
      await this.productVariantsService.exportProductVariants(exportProductVariantsDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductVariants(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.productVariantsService.importProductVariants({ file, user });
  }

  @Get(':id')
  getProductVariant(@Param('id') id: ProductVariant['id']) {
    return this.productVariantsService.getProductVariant({ id });
  }

  @Delete(':id')
  deleteProductVariant(@Param('id') id: ProductVariant['id']) {
    return this.productVariantsService.deleteProductVariant({ id });
  }
}
