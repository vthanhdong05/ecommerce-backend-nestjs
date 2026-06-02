import { Body, Controller, Get, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ExportRolePermissionsDto } from './dto/get-role-permission.dto';
import { RolePermissionsService } from './role-permissions.service';

@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Get()
  getRolePermissions() {
    return this.rolePermissionsService.getRolePermissions();
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportRolePermissions(@Body() params: ExportRolePermissionsDto, @Res() res: Response) {
    const workbook = await this.rolePermissionsService.exportRolePermissions(params);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importRolePermissions(@UploadedFile() file, @User() user) {
    return this.rolePermissionsService.importRolePermissions({
      file,
      user,
    });
  }
}
