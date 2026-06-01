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
import { Permission } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ExportPermissionsDto, GetPermissionsPaginationDto } from './dto/get-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  createPermission(@Body() createDto: CreatePermissionDto, @User() user: UserInfo) {
    return this.permissionsService.createPermission(createDto, user);
  }

  @Patch(':id')
  updatePermission(
    @Param('id') id: Permission['id'],
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission({
      data: updatePermissionDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getPermissions(@Query() query: GetPermissionsPaginationDto) {
    return this.permissionsService.getPermissions(query);
  }

  @Get('options')
  getPermissionOptions(@Query() query: GetOptionsParams<Permission>) {
    return this.permissionsService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportPermissions(
    @Query() exportPermissionsDto: ExportPermissionsDto,
    @Res() res: Response,
  ) {
    const workbook = await this.permissionsService.exportPermissions(exportPermissionsDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importPermissions(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.permissionsService.importPermissions({ file, user });
  }

  @Get(':id')
  getPermission(@Param('id') id: Permission['id']) {
    return this.permissionsService.getPermission({ id });
  }

  @Delete(':id')
  deletePermission(@Param('id') id: Permission['id']) {
    return this.permissionsService.deletePermission({ id });
  }
}
