import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImage, Vendor } from '@prisma/client';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { Product } from '../products/entities/product.entity';
import { VendorProductImageParams } from './const/vendor-product-image.const';
import { UpdateProductImageDto } from './dto/update-product-images.dto';
import { ProductImagesService } from './product-images.service';

@Controller(
  `vendors/:${VendorProductImageParams.VENDOR_ID_PARAM}/products/:${VendorProductImageParams.PRODUCT_ID_PARAM}/images`,
)
export class VendorProductImageController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserInfo,
  ) {
    return this.productImagesService.uploadProductImage({
      file,
      user,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get()
  getProductImages(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
  ) {
    return this.productImagesService.getProductImagesByProduct({
      vendorID: vendorId,
      productID: productId,
    });
  }

  @Patch(':id')
  updateProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductImage['id'],
    @Body() updateDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.updateProductImage({
      where: { id, vendorID: vendorId, productID: productId },
      data: updateDto,
    });
  }

  @Delete(':id')
  deleteProductImage(
    @Param(VendorProductImageParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductImageParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductImage['id'],
  ) {
    return this.productImagesService.deleteProductImage({
      id,
      vendorID: vendorId,
      productID: productId,
    });
  }
}
