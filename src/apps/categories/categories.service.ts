import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateCategoryDto, ImportCategoriesDto } from './dto/create-category.dto';
import { ExportCategoriesDto, GetCategoriesPaginationDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CacheHelperService } from 'src/common/utils/cache-util/cache-helper.service';

@Injectable()
export class CategoriesService extends PrismaBaseService<'category'> implements Options<Category> {
  private categoryEntityName = Category.name;
  private excelSheets = {
    [this.categoryEntityName]: this.categoryEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private cacheHelper: CacheHelperService,
  ) {
    super(prismaService, 'category');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getCategory(where: Prisma.CategoryWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getCategories({ page, itemPerPage }: GetCategoriesPaginationDto) {
    const cacheKey = `categories:list:${page}:${itemPerPage}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const totalItems = await this.extended.count();
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      skip: paging.skip,
      take: itemPerPage,
    });
    const data = paging.format(list);
    await this.cacheManager.set(cacheKey, data, 5 * 60 * 1000); // 5 phút
    return data;
  }

  async createCategory(createCategoryDto: CreateCategoryDto, user: UserInfo) {
    const data = await this.extended.create({
      data: {
        ...createCategoryDto,
        user,
      } as any,
    });
    await this.invalidateCategoriesCache();
    return data;
  }

  private async invalidateCategoriesCache() {
    await this.cacheHelper.deleteByPattern('categories:list:*');
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: UpdateCategoryDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  async getOptions(params: GetOptionsParams<Category>) {
    const { limit, select, ...searchFields } = params;
    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);
    const data = await this.extended.findMany({
      select: fieldsSelect,
      where: {
        ...searchFields,
      },
      take: Number(limit),
    });
    return data;
  }

  async exportCategories({ ids }: ExportCategoriesDto) {
    const [categories, allCategories] = await Promise.all([
      this.extended.export({
        where: { id: { in: ids } },
      }),
      this.extended.findMany({
        select: { id: true, name: true },
      }),
    ]);
    const idToName = new Map<string, string>(allCategories.map((cat) => [cat.id, cat.name]));
    const mappedCategories = categories.map((cat) => {
      const mapped: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(cat)) {
        if (key === 'parentID') {
          mapped['parentName'] = value ? (idToName.get(value as string) ?? null) : null;
        } else {
          mapped[key] = value;
        }
      }
      return mapped;
    });
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.categoryEntityName],
          data: mappedCategories,
        },
      ],
    });
    return data;
  }

  async importCategories({ file, user }: ImportCategoriesDto) {
    const categorySheetName = this.excelSheets[this.categoryEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[categorySheetName];

    const categoriesData = new Map<string, string>(); // name -> id
    const allCategories = await this.extended.findMany({
      select: { id: true, name: true },
    });
    for (const category of allCategories) {
      categoriesData.set(category.name, category.id);
    }
    // (Map parentName -> parentID cho từng dòng Excel)
    const mappedData = dataImport.map((item) => {
      const { parentName, ...rest } = item ?? {};

      let parentID: string | undefined = undefined;

      if (parentName) {
        parentID = categoriesData.get(parentName);
        if (!parentID) {
          throw new BadRequestException(`Parent category not found with name: "${parentName}"`);
        }
      }
      return { ...rest, parentID, user };
    });
    const data = await this.extended.createMany({ data: mappedData });
    return data;
  }

  async deleteCategory(where: Prisma.CategoryWhereUniqueInput) {
    const hasChildren = await this.extended.findFirst({
      where: { parentID: where.id as string },
    });
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete a category that has subcategories. Delete or move subcategories first.',
      );
    }
    return this.extended.softDelete(where);
  }
}
