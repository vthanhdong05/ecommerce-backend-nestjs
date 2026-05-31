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
import { Role } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { ExportRolesDto, GetRolesPaginationDto } from './dto/get-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  createRole(@Body() createDto: CreateRoleDto) {
    return this.rolesService.createRole(createDto);
  }

  @Patch(':id')
  updateRole(@Param('id') id: Role['id'], @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole({
      data: updateRoleDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe) // convert type (string → number)
  getRoles(@Query() query: GetRolesPaginationDto) {
    return this.rolesService.getRoles(query);
  }

  @Get('options')
  getRoleOptions(@Query() query: GetOptionsParams<Role>) {
    return this.rolesService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportRoles(@Query() exportRolesDto: ExportRolesDto, @Res() res: Response) {
    const workbook = await this.rolesService.exportRoles(exportRolesDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importRoles(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.rolesService.importRoles({ file, user });
  }

  @Get(':id')
  getRole(@Param('id') id: Role['id']) {
    return this.rolesService.getRole({ id });
  }

  @Delete(':id')
  deleteRole(@Param('id') id: Role['id']) {
    return this.rolesService.deleteRole({ id });
  }
}
