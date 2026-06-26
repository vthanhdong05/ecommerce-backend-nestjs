import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorParam } from './consts/vendor.const';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller(`vendors/:${VendorParam.VENDOR_ID_PARAM}/profile`)
export class VendorProfileController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @SkipPermission()
  getVendorProfile(@Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id']) {
    return this.vendorsService.getVendorProfile(vendorId);
  }

  @Patch()
  @SkipPermission()
  updateVendorProfile(
    @Param(VendorParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Body() updateVendorDto: UpdateVendorDto,
    @User() user: UserInfo,
  ) {
    return this.vendorsService.updateVendorProfile({
      vendorID: vendorId,
      userID: user.userID,
      data: updateVendorDto,
    });
  }
}
