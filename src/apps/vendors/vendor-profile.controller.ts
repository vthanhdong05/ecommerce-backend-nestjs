import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorParam } from './consts/vendor.const';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller(`vendors/:${VendorParam.VENDOR_ID_PARAM}/profile`)
export class VendorProfileController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  getVendorProfile(@Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id']) {
    return this.vendorsService.getVendorProfile(vendorId);
  }

  @Patch(':id')
  updateVendorProfile(
    @Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.updateVendorProfile({
      vendorID: vendorId,
      data: updateVendorDto,
    });
  }
}
