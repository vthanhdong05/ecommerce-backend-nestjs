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
import { Product, ProductVariant } from '@prisma/client';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from 'src/common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorProductVariantParams } from './consts/vendor-product-variant.const';
import { CreateVendorProductVariantDto } from './dto/create-product-variant.dto';
import {
  ExportProductVariantsDto,
  GetProductVariantsPaginationDto,
} from './dto/get-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantsService } from './product-variants.service';

@Controller(
  `vendors/:${VendorProductVariantParams.VENDOR_ID_PARAM}/products/:${VendorProductVariantParams.PRODUCT_ID_PARAM}/variants`,
)
export class VendorProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProductVariants(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Query() exportDto: ExportProductVariantsDto,
    @Res() res: Response,
  ) {
    const workbook = await this.productVariantsService.exportProductVariants({
      ...exportDto,
      productID: productId,
      vendorID: vendorId,
    });
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProductVariants(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @UploadedFile() file: File,
    @User() user: UserInfo,
  ) {
    return this.productVariantsService.importProductVariants({
      file,
      user,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get('options')
  getProductVariantOptions(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Query() query: GetOptionsParams<ProductVariant>,
  ) {
    return this.productVariantsService.getOptions({
      ...query,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Post()
  createProductVariant(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Body() createDto: CreateVendorProductVariantDto,
    @User() user: UserInfo,
  ) {
    return this.productVariantsService.createProductVariant(
      { ...createDto, productID: productId },
      user,
      vendorId,
    );
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getProductVariants(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Query() query: GetProductVariantsPaginationDto,
  ) {
    return this.productVariantsService.getProductVariants({
      ...query,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Get(':id')
  getProductVariant(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductVariant['id'],
  ) {
    return this.productVariantsService.getProductVariant({
      id,
      productID: productId,
      vendorID: vendorId,
    });
  }

  @Patch(':id')
  updateProductVariant(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductVariant['id'],
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.updateProductVariant({
      data: updateDto,
      where: { id, productID: productId, vendorID: vendorId },
    });
  }

  @Delete(':id')
  deleteProductVariant(
    @Param(VendorProductVariantParams.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Param(VendorProductVariantParams.PRODUCT_ID_PARAM) productId: Product['id'],
    @Param('id') id: ProductVariant['id'],
  ) {
    return this.productVariantsService.deleteProductVariant({
      id,
      productID: productId,
      vendorID: vendorId,
    });
  }
}
