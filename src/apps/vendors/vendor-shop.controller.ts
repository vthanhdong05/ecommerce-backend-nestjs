// vendor-shop.controller.ts
import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import { SkipAuth } from '../auth/auth.decorator';
import { GetProductsPaginationDto } from '../products/dto/get-product.dto';
import { ProductsService } from '../products/products.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorParam } from './consts/vendor.const';
import { VendorsService } from './vendors.service';

@Controller(`vendors/:${VendorParam.VENDOR_ID_PARAM}/shop`)
export class VendorShopController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly productsService: ProductsService,
  ) {}

  // Thông tin công khai của shop — tên, mô tả, logo, tổng sản phẩm, tổng đơn
  @Get()
  @SkipAuth()
  getShopInfo(@Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id']) {
    return this.vendorsService.getShopInfo(vendorId);
  }

  // Danh sách sản phẩm đang active của shop — user duyệt mua hàng
  @Get('products')
  @SkipAuth()
  @UsePipes(ParseParamsPaginationPipe)
  getShopProducts(
    @Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Query() query: GetProductsPaginationDto,
  ) {
    return this.productsService.getProducts({ ...query, vendorID: vendorId });
  }
}
