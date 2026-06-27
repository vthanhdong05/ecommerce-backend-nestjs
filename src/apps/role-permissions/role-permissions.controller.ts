import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
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
  async exportRolePermissions(@Query() params: ExportRolePermissionsDto, @Res() res: Response) {
    const workbook = await this.rolePermissionsService.exportRolePermissions(params);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importRolePermissions(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.rolePermissionsService.importRolePermissions({ file, user });
  }
}
