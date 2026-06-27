import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { VendorsService } from '../vendors/vendors.service';
import { ImportProductCategoriesDto } from './dto/create-product-category.dto';
import { ExportProductCategoriesDto } from './dto/get-product-category.dto';
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
    if (productIDs) where.productID = { in: productIDs };
    if (categoryIDs) where.categoryID = { in: categoryIDs };
    const productCategories = await this.extended.export({
      select: {
        category: { select: { name: true, slug: true } },
        product: { select: { name: true } },
      },
      where,
    });
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productCategoryEntityName],
          data: productCategories.map(({ product, category }) => ({
            productName: product.name,
            categoryName: category.name,
            categorySlug: category.slug,
          })),
        },
      ],
    });
  }

  async importProductCategories({ file, user }: ImportProductCategoriesDto) {
    const productCategorySheetName = this.excelSheets[this.productCategoryEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const dataImport = dataCreated[productCategorySheetName];
    // Lấy tất cả product/category hiện có trong DB
    const [allProducts, allCategories] = await Promise.all([
      this.productsService.client.findMany({ select: { id: true, name: true } }),
      this.categoriesService.client.findMany({ select: { id: true, name: true } }),
    ]);
    const productNameMap = new Map(allProducts.map((p) => [p.name, p.id]));
    const categoryNameMap = new Map(allCategories.map((c) => [c.name, c.id]));
    // Throw lỗi nếu product/category chưa tồn tại — không tự tạo mới để tránh tạo dữ liệu rác
    const idsMapping = dataImport.map((item) => {
      const { productName, categoryName } = item ?? {};
      const productID = productNameMap.get(productName);
      if (!productID) {
        throw new BadRequestException(
          `Product not found: "${productName}". Please create it first.`,
        );
      }
      const categoryID = categoryNameMap.get(categoryName);
      if (!categoryID) {
        throw new BadRequestException(
          `Category not found: "${categoryName}". Please create it first.`,
        );
      }
      return { productID, categoryID };
    });
    // deleteMany + createMany trong cùng 1 transaction — rollback nếu createMany lỗi
    return this.prismaService.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { OR: idsMapping } });
      return tx.productCategory.createMany({
        data: idsMapping.map((item) => ({ ...item, createdBy: user.userEmail })),
      });
    });
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
