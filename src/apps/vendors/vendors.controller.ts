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
import { Vendor } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { ExportVendorsDto, GetVendorsPaginationDto } from './dto/get-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  createVendor(@Body() createDto: CreateVendorDto, @User() user: UserInfo) {
    return this.vendorsService.createVendor(createDto, user);
  }

  @Patch(':id')
  updateVendor(@Param('id') id: Vendor['id'], @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.updateVendor({
      data: updateVendorDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe) // (convert type (string → number))
  getVendors(@Query() query: GetVendorsPaginationDto) {
    return this.vendorsService.getVendors(query);
  }

  @Get('options')
  getVendorOptions(@Query() query: GetOptionsParams<Vendor>) {
    return this.vendorsService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor) // (xử lý response trước khi trả về)
  async exportVendors(@Query() exportVendorsDto: ExportVendorsDto, @Res() res: Response) {
    const workbook = await this.vendorsService.exportVendors(exportVendorsDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importVendors(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.vendorsService.importVendors({ file, user });
  }

  @Get(':id')
  getVendor(@Param('id') id: Vendor['id']) {
    return this.vendorsService.getVendor({ id });
  }

  @Delete(':id')
  deleteVendor(@Param('id') id: Vendor['id']) {
    return this.vendorsService.deleteVendor({ id });
  }
}
