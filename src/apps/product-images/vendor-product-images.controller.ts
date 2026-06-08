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
import { ProductImage } from '@prisma/client';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from 'src/common/interceptors/excel-response/excel-response.interceptor';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { Product } from '../products/entities/product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorProductImageParams } from './const/vendor-product-image.const';
import { ExportProductImagesDto } from './dto/get-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-images.dto';
import { ProductImagesService } from './product-images.service';

@Controller(
  `vendors/:${VendorProductImageParams.VENDOR_ID_PARAM}/products/:${VendorProductImageParams.PRODUCT_ID_PARAM}/images`,
)
export class VendorProductImageController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadProductImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @UploadedFiles() files: File[],
    @User() user: UserInfo,
  ) {
    return this.productImagesService.uploadProductImages({
      files,
      user,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @UploadedFile() file: File,
    @User() user: UserInfo,
  ) {
    return this.productImagesService.importProductImages({
      file,
      user,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProductImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Query() exportDto: ExportProductImagesDto,
    @Res() res: Response,
  ) {
    const workbook = await this.productImagesService.exportProductImages({
      ...exportDto,
      productID: productId,
      vendorID: vendorId,
    });
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get()
  getProductImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
  ) {
    return this.productImagesService.getProductImages({
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get(':id')
  getProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductImage['id'],
  ) {
    return this.productImagesService.getProductImage({
      id,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Patch(':id')
  updateProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param('id') id: ProductImage['id'],
    @Body() updateDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.updateProductImage({
      where: { id, vendorID: vendorId },
      data: updateDto,
    });
  }

  @Delete(':id')
  deleteProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param('id') id: ProductImage['id'],
  ) {
    return this.productImagesService.deleteProductImage({
      id,
      vendorID: vendorId,
    });
  }
}
