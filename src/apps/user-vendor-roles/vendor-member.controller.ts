import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from 'src/common/interceptors/excel-response/excel-response.interceptor';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorMemberParam } from './const/vendor-member.const';
import { AddMemberDto, UpdateMemberDto } from './dto/add-members.dto';
import { UserVendorRole } from './entities/user-vendor-role.entity';
import { UserVendorRolesService } from './user-vendor-roles.service';

@Controller(`vendors/:${VendorMemberParam.VENDOR_ID_PARAM}/members`)
export class VendorMembersController {
  constructor(private readonly userVendorRolesService: UserVendorRolesService) {}

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportMembers(
    @Param(VendorMemberParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Res() res: Response,
  ) {
    const workbook = await this.userVendorRolesService.exportMembers(vendorId);
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importMembers(
    @Param(VendorMemberParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @UploadedFile() file: File,
    @User() user: UserInfo,
  ) {
    return this.userVendorRolesService.importMembers({
      vendorID: vendorId,
      file,
      user,
    });
  }

  @Get()
  getMembers(@Param(VendorMemberParam.VENDOR_ID_PARAM) vendorId: Vendor['id']) {
    return this.userVendorRolesService.getMembers(vendorId);
  }

  @Post()
  addMember(
    @Param(VendorMemberParam.VENDOR_ID_PARAM) vendorId: Vendor['id'],
    @Body() addMemberDto: AddMemberDto,
    @User() user: UserInfo,
  ) {
    return this.userVendorRolesService.addMember({
      vendorID: vendorId,
      ...addMemberDto,
      user,
    });
  }

  @Patch(`:${VendorMemberParam.MEMBER_ID_PARAM}`)
  updateMember(
    @Param(VendorMemberParam.MEMBER_ID_PARAM) id: UserVendorRole['id'],
    @Body() updateMemberDto: UpdateMemberDto,
    @User() user: UserInfo,
  ) {
    return this.userVendorRolesService.updateMember({
      id,
      ...updateMemberDto,
      user,
    });
  }

  @Delete(`:${VendorMemberParam.MEMBER_ID_PARAM}`)
  removeMember(@Param(VendorMemberParam.MEMBER_ID_PARAM) id: UserVendorRole['id']) {
    return this.userVendorRolesService.removeMember(id);
  }
}
