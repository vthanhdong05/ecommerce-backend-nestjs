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
import { Category } from '@prisma/client';
import type { Response } from 'express';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ExcelResponseInterceptor } from '../../common/interceptors/excel-response/excel-response.interceptor';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import type { File } from '../../common/utils/excel-util/dto/excel-util.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ExportCategoriesDto, GetCategoriesPaginationDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() createDto: CreateCategoryDto, @User() user: UserInfo) {
    return this.categoriesService.createCategory(createDto, user);
  }

  @Patch(':id')
  updateCategory(@Param('id') id: Category['id'], @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory({
      data: updateCategoryDto,
      where: { id },
    });
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getCategories(@Query() query: GetCategoriesPaginationDto) {
    return this.categoriesService.getCategories(query);
  }

  @Get('options')
  getCategoryOptions(@Query() query: GetOptionsParams<Category>) {
    return this.categoriesService.getOptions(query);
  }

  @Get('export')
  @UseInterceptors(ExcelResponseInterceptor)
  async exportCategories(@Query() exportCategoriesDto: ExportCategoriesDto, @Res() res: Response) {
    const workbook = await this.categoriesService.exportCategories(exportCategoriesDto);
    await workbook.xlsx.write(res);
    res.end();
    return { message: 'Export success' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importCategories(@UploadedFile() file: File, @User() user: UserInfo) {
    return this.categoriesService.importCategories({ file, user });
  }

  @Get(':id')
  getCategory(@Param('id') id: Category['id']) {
    return this.categoriesService.getCategory({ id });
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: Category['id']) {
    return this.categoriesService.deleteCategory({ id });
  }
}
