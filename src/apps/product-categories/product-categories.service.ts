import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { VendorsService } from '../vendors/vendors.service';
import { ImportProductCategoriesDto } from './dto/create-product-category.dto';
import {
  CategoriesData,
  CategoriesImportCreate,
  ExportProductCategoriesDto,
  ProductsData,
  ProductsImportCreate,
} from './dto/get-product-category.dto';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoriesService extends PrismaBaseService<'productCategory'> {
  private productCategoryEntityName = ProductCategory.name;
  private excelSheets = {
    [this.productCategoryEntityName]: this.productCategoryEntityName,
  };
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private vendorsService: VendorsService,
  ) {
    super(prismaService, 'productCategory');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async exportProductCategories(params: ExportProductCategoriesDto) {
    const { productIDs, categoryIDs } = params ?? {};
    const where: Prisma.ProductCategoryWhereInput = {};

    if (productIDs) {
      where.productID = { in: productIDs };
    }
    if (categoryIDs) {
      where.categoryID = { in: categoryIDs };
    }

    const productCategories = await this.extended.export({
      select: {
        category: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      where,
    });

    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productCategoryEntityName],
          fieldsMapping: {
            productID: 'productName',
            categoryID: 'categoryName',
          },
          fieldsExtend: ['categoryKey'],
          fieldsExclude: ['createdAt', 'createdBy'],
          data: productCategories.map(({ product, category }) => ({
            productName: product.name,
            categoryName: category.name,
            categoryKey: category.key,
          })),
        },
      ],
    });

    return data;
  }

  async importProductCategories({ file, user }: ImportProductCategoriesDto) {
    const productCategorySheetName = this.excelSheets[this.productCategoryEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[productCategorySheetName];
    const { productsImport, categoriesImport } = dataImport.reduce(
      (acc, item) => {
        const { productName, categoryName, categoryKey } = item ?? {};
        acc.productsImport.add({ productName });
        acc.categoriesImport.add({ categoryName, categoryKey });
        return acc;
      },
      {
        productsImport: new Set(),
        categoriesImport: new Set(),
      },
    );

    const productsData: ProductsData = [];
    const productsCreate: ProductsImportCreate = [];
    if (productsImport.size > 0) {
      const products = await this.productsService.client.findMany({
        select: { id: true, name: true },
      });
      const productNameListData = new Map();
      for (const product of products) {
        productNameListData.set(product.name, product);
      }

      const vendorsData = await this.vendorsService.extended.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      for (const productImport of productsImport) {
        const { productName, productSlug, productPrice, vendorName } = productImport;
        const productCurrent = productNameListData.get(productName);
        if (productCurrent) {
          productsData.push(productCurrent);
        } else {
          const vendor = vendorsData.find((vendor) => vendor.name === vendorName);
          if (!vendor)
            throw new BadRequestException(`Not found vendor ${vendorName}, please create it`);
          productsCreate.push({
            name: productName,
            vendorID: vendor.id,
            slug: productSlug,
            price: productPrice,
          });
        }
      }
      const productsCreated = await this.productsService.extended.createManyAndReturn({
        data: productsCreate.map((product) => ({ ...product, user })),
        select: {
          id: true,
          name: true,
        },
      });
      productsData.push(...productsCreated);
    }

    const categoriesData: CategoriesData = [];
    const categoriesCreate: CategoriesImportCreate = [];
    if (categoriesImport.size > 0) {
      const categories = await this.categoriesService.client.findMany({
        select: { id: true, name: true },
      });
      const categoryNameListData = new Map();
      for (const category of categories) {
        categoryNameListData.set(category.name, category);
      }

      for (const categoryImport of categoriesImport) {
        const { categoryName, categorySlug } = categoryImport;
        const categoryCurrent = categoryNameListData.get(categoryName);
        if (categoryCurrent) {
          categoriesData.push(categoryCurrent);
        } else {
          categoriesCreate.push({ name: categoryName, slug: categorySlug });
        }
      }

      const categoriesCreated = await this.categoriesService.extended.createManyAndReturn({
        data: categoriesCreate.map((category) => ({
          ...category,
          user,
        })),
        select: {
          id: true,
          name: true,
        },
      });
      categoriesData.push(...categoriesCreated);
    }

    const productNameListData = new Map();
    for (const product of productsData) {
      productNameListData.set(product.name, product.id);
    }

    const categoryNameListData = new Map();
    for (const category of categoriesData) {
      categoryNameListData.set(category.name, category.id);
    }

    const idsMapping = dataImport.map((item) => ({
      productID: productNameListData.get(item.productName),
      categoryID: categoryNameListData.get(item.categoryName),
    }));

    await this.extended.deleteMany({
      where: { OR: idsMapping },
    });

    const data = await this.extended.createMany({
      data: idsMapping.map((item) => ({ ...item, user })),
    });
    return data;
  }

  async getProductCategories() {
    const data = await this.extended.findMany({
      select: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    // Gom nhóm theo product
    const productMap = new Map<
      string,
      {
        product: {
          id: string;
          name: string;
          description: string | null;
        };
        categories: {
          id: string;
          name: string;
          description: string | null;
        }[];
      }
    >();
    for (const { product, category } of data) {
      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          product,
          categories: [],
        });
      }
      productMap.get(product.id)!.categories.push(category);
    }
    return [...productMap.values()];
  }
}
