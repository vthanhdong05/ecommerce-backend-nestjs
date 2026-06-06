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
import { Product } from '@prisma/client';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from 'src/common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProductParams } from './consts/product.const';
import { CreateProductDto } from './dto/create-product.dto';
import { ExportProductsDto, GetProductsPaginationDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller(`vendors/:${ProductParams.VENDOR_ID}/products`)
export class VendorProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportProducts(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Query() exportProductsDto: ExportProductsDto,
    @Res() res: Response,
  ) {
    const workbook = await this.productsService.exportProducts({
      ...exportProductsDto,
      vendorID: vendorId,
    });
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importProducts(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @UploadedFile() file: File,
    @User() user: UserInfo,
  ) {
    return this.productsService.importProducts({
      file,
      user,
      vendorID: vendorId,
    });
  }

  @Get('options')
  getProductOptions(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Query() query: GetOptionsParams<Product>,
  ) {
    return this.productsService.getOptions({ ...query, vendorID: vendorId });
  }

  @Post()
  createProduct(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Body() createDto: CreateProductDto,
    @User() user: UserInfo,
  ) {
    return this.productsService.createProduct(
      {
        ...createDto,
        vendor: {
          connect: {
            id: vendorId,
          },
        },
      } as CreateProductDto,
      user,
    );
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getProducts(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Query() query: GetProductsPaginationDto,
  ) {
    return this.productsService.getProducts({ ...query, vendorID: vendorId });
  }

  @Get(`:id`)
  getProduct(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Param('id') id: Product['id'],
  ) {
    return this.productsService.getProduct({ id, vendorID: vendorId });
  }

  @Patch(`:id`)
  updateProduct(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Param('id') id: Product['id'],
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct({
      data: updateProductDto,
      where: { id, vendorID: vendorId },
    });
  }

  @Delete(`:id`)
  deleteProduct(
    @Param(ProductParams.VENDOR_ID) vendorId: Vendor['id'],
    @Param('id') id: Product['id'],
  ) {
    return this.productsService.deleteProduct({ id, vendorID: vendorId });
  }
}
