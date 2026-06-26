import { Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ExportUserVendorRolesDto } from './dto/get-user-vendor-role.dto';
import { UserVendorRolesService } from './user-vendor-roles.service';

@Controller('user-vendor-roles')
export class UserVendorRolesController {
  constructor(private readonly userVendorRolesService: UserVendorRolesService) {}

  @Get()
  getUserVendorRoles() {
    return this.userVendorRolesService.getUserVendorRoles();
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportUserVendorRoles(@Query() params: ExportUserVendorRolesDto, @Res() res: Response) {
    const workbook = await this.userVendorRolesService.exportUserVendorRoles(params);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importUserVendorRoles(@UploadedFile() file, @Req() req) {
    return this.userVendorRolesService.importUserVendorRoles({
      file,
      user: req.user,
    });
  }
}
