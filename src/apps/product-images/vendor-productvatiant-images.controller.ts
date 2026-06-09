import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductImage, ProductVariant, Vendor } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { VendorProductImageParams } from './const/vendor-product-image.const';
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
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: string,
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

  @Get()
  getVariantImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: string,
    @Param(VendorProductImageParams.VARIANT_ID_PARAM) variantId: ProductVariant['id'],
  ) {
    return this.productImagesService.getProductImagesByProduct({
      vendorID: vendorId,
      productID: productId,
      productVariantID: variantId,
    });
  }

  @Patch(':id')
  updateVariantImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: string,
    @Param('id') id: ProductImage['id'],
    @Body() updateDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.updateProductImage({
      where: { id, vendorID: vendorId, productID: productId },
      data: updateDto,
    });
  }

  @Delete(':id')
  deleteVariantImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: string,
    @Param('id') id: ProductImage['id'],
  ) {
    return this.productImagesService.deleteProductImage({
      id,
      vendorID: vendorId,
      productID: productId,
    });
  }
}
