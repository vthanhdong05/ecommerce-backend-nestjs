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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CreateProductImageDto } from './dto/create-product-images.dto';
import { ExportProductImagesDto } from './dto/get-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-images.dto';
import type { ProductImage as ProductImageEntity } from './entities/product-images.entity';
import { ProductImagesService } from './product-images.service';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  createProductImage(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImagesService.createProductImage(createProductImageDto);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProductImages(
    @Query() exportProductImagesDto: ExportProductImagesDto,
    @Res() res: Response,
  ) {
    const workbook = await this.productImagesService.exportProductImages(exportProductImagesDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export productImages success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductImages(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.productImagesService.importProductImages({
      file,
      user,
    });
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadProductImages(@UploadedFiles() files: File[], @User() user: UserInfo) {
    return this.productImagesService.uploadProductImages({
      files,
      user,
    });
  }

  @Get()
  getProductImages() {
    return this.productImagesService.getProductImages();
  }

  @Get(':id')
  getProductImage(@Param('id') id: ProductImageEntity['id']) {
    return this.productImagesService.getProductImage({ id });
  }

  @Patch(':id')
  updateProductImage(
    @Param('id') id: ProductImageEntity['id'],
    @Body() updateProductImageDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.updateProductImage({
      data: updateProductImageDto,
      where: { id },
    });
  }

  @Delete(':id')
  deleteProductImage(@Param('id') id: ProductImageEntity['id']) {
    return this.productImagesService.deleteProductImage({ id });
  }
}
