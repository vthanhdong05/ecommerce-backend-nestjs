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
import { ProductImage, ProductVariant } from '@prisma/client';
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
  `vendors/:${VendorProductImageParams.VENDOR_ID_PARAM}/products/:${VendorProductImageParams.PRODUCT_ID_PARAM}/variants/:${VendorProductImageParams.VARIANT_ID_PARAM}/images`,
)
export class VendorProductVariantImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadVariantImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param(VendorProductImageParams.VARIANT_ID_PARAM) variantId: ProductVariant['id'],
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: UserInfo,
  ) {
    return this.productImagesService.uploadProductImages({
      files,
      user,
      productID: productId,
      productVariantID: variantId,
      vendorID: vendorId,
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importVariantImages(
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
  async exportVariantImages(
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
  getVariantImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param(VendorProductImageParams.VARIANT_ID_PARAM) variantId: ProductVariant['id'],
  ) {
    return this.productImagesService.getProductImages({
      where: { productVariantID: variantId },
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get(':id')
  getVariantImage(
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
  updateVariantImage(
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
  deleteVariantImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param('id') id: ProductImage['id'],
  ) {
    return this.productImagesService.deleteProductImage({
      id,
      vendorID: vendorId,
    });
  }
}
