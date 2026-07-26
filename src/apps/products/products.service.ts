import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ProductStatus, ProductVariant } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorsService } from '../vendors/vendors.service';
import { CreateProductDto, ImportProductsDto } from './dto/create-product.dto';
import { ExportProductsDto, GetProductsPaginationDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService extends PrismaBaseService<'product'> implements Options<Product> {
  private productEntityName = Product.name;
  private excelSheets = {
    [this.productEntityName]: this.productEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private stringUtilService: StringUtilService,
    private queryUtil: QueryUtilService,
    private vendorService: VendorsService,
    private eventEmitter: EventEmitter2,
  ) {
    super(prismaService, 'product');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getProduct(where: Prisma.ProductWhereUniqueInput & { vendorID?: Vendor['id'] }) {
    const { vendorID, ...uniqueWhere } = where;
    const data = await this.extended.findFirst({
      where: { ...uniqueWhere, ...(vendorID && { vendorID }) },
      include: { productCategories: { select: { categoryID: true } } },
    });
    if (!data) return null;
    const { productCategories, ...rest } = data as any;
    return { ...rest, categoryIDs: productCategories.map((pc: any) => pc.categoryID) };
  }

  async getProducts({
    page,
    itemPerPage,
    vendorID,
  }: GetProductsPaginationDto & { vendorID?: Vendor['id'] }) {
    const where = { ...(vendorID && { vendorID }) };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      include: { productCategories: { select: { categoryID: true } } },
    });
    const mapped = (list as any[]).map(({ productCategories, ...rest }) => ({
      ...rest,
      categoryIDs: productCategories.map((pc: any) => pc.categoryID),
    }));
    return paging.format(mapped);
  }

  async createProduct(createProductDto: CreateProductDto, user: UserInfo) {
    const { categoryIDs, ...productData } = createProductDto;
    const data = await this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          slug: this.stringUtilService.toSlug(productData.name),
          createdBy: user.userEmail,
          productCategories: {
            create: categoryIDs.map((categoryID) => ({ categoryID })),
          },
        } as any,
      });
      await tx.productVariant.create({
        data: {
          productID: product.id,
          name: null,
          price: product.price,
          stockQuantity: product.stockQuantity,
          isDefault: true,
          createdBy: user.userEmail,
        },
      });
      return product;
    });
    this.eventEmitter.emit('product.created', { vendorID: data.vendorID });
    return data;
  }

  async updateProduct(params: {
    where: Prisma.ProductWhereUniqueInput & { vendorID?: Vendor['id'] };
    data: UpdateProductDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { vendorID, ...uniqueWhere } = where;
    if (vendorID) {
      const product = await this.extended.findFirst({
        where: { id: uniqueWhere.id, vendorID },
      });
      if (!product) throw new NotFoundException('Product not found');
    }
    // Tách categoryIDs ra khỏi dataUpdate trước khi đẩy vào tx.product.update — vì
    // Product model không có field `categoryIDs` (quan hệ n-n qua bảng productCategory).
    const { categoryIDs, ...productData } = dataUpdate as UpdateProductDto & {
      categoryIDs?: string[];
    };
    return this.prismaService.$transaction(async (tx) => {
      const data = await tx.product.update({
        data: productData,
        where: uniqueWhere,
      });
      // Đồng bộ giá/tồn kho xuống variant ẩn, vì OrderItem luôn lấy giá từ ProductVariant, không phải từ Product
      if (dataUpdate.price !== undefined || dataUpdate.stockQuantity !== undefined) {
        await tx.productVariant.updateMany({
          where: { productID: uniqueWhere.id, isDefault: true },
          data: {
            ...(dataUpdate.price !== undefined && { price: dataUpdate.price }),
            ...(dataUpdate.stockQuantity !== undefined && {
              stockQuantity: dataUpdate.stockQuantity,
            }),
          },
        });
      }
      // Sync product ↔ categories (chỉ khi FE gửi categoryIDs). Cho phép mảng rỗng
      // để vendor "xóa hết" categories nếu muốn.
      if (categoryIDs !== undefined) {
        await tx.productCategory.deleteMany({ where: { productID: uniqueWhere.id } });
        if (categoryIDs.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIDs.map((categoryID) => ({
              productID: uniqueWhere.id!,
              categoryID,
            })),
          });
        }
      }
      return data;
    });
  }

  async getOptions(params: GetOptionsParams<Product>) {
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

  // (Admin gọi /products/export → vendorID = undefined → export tất cả)
  // (Vendor gọi /vendors/:vendorId/products/export → vendorID = "abc" → chỉ export của vendor đó)
  async exportProducts({ ids, vendorID }: ExportProductsDto & { vendorID?: Vendor['id'] }) {
    const [products, allVendors] = await Promise.all([
      this.extended.export({
        where: {
          ...(ids && { id: { in: ids } }),
          ...(vendorID && { vendorID }),
        },
        include: { productCategories: { select: { category: { select: { name: true } } } } },
      }),
      this.vendorService.client.findMany({ select: { id: true, name: true } }),
    ]);
    const idToVendorName = new Map(allVendors.map((v) => [v.id, v.name]));
    const mappedProducts = (products as any[]).map(({ productCategories, ...product }) => {
      const mapped: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(product)) {
        if (key === 'vendorID') {
          mapped['vendorName'] = value ? (idToVendorName.get(value as string) ?? null) : null;
        } else {
          mapped[key] = value;
        }
      }
      mapped['categoryNames'] = productCategories.map((pc: any) => pc.category.name).join(', ');
      return mapped;
    });
    return this.excelUtilService.generateExcel({
      worksheets: [{ sheetName: this.excelSheets[this.productEntityName], data: mappedProducts }],
    });
  }

  // (Admin phải có cột vendorName)
  // (Vendor không cần cột VendorName gán thẳng vendorID từ URL)
  async importProducts({ file, user, vendorID }: ImportProductsDto & { vendorID?: Vendor['id'] }) {
    const productSheetName = this.excelSheets[this.productEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const rows = dataCreated[productSheetName];
    const allCategoryNames = [
      ...new Set(
        rows.flatMap((r: any) =>
          (r.categoryNames as string)
            .split(',')
            .map((n: string) => n.trim())
            .filter(Boolean),
        ),
      ),
    ] as string[];
    const categories = await this.prismaService.category.findMany({
      where: { name: { in: allCategoryNames } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
    for (const name of allCategoryNames) {
      if (!categoryMap.has(name)) throw new BadRequestException(`Category not found: "${name}"`);
    }
    const resolveCategories = (categoryNames: string) =>
      categoryNames
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => categoryMap.get(n)!);

    if (vendorID) {
      return this.prismaService.$transaction(async (tx) => {
        const createdProducts = await tx.product.createManyAndReturn({
          data: rows.map(({ vendorName: _v, categoryNames: _cn, ...rest }: any) => ({
            ...rest,
            slug: this.stringUtilService.toSlug(rest.name),
            vendorID,
            createdBy: user.userEmail,
          })),
        });
        await tx.productVariant.createMany({
          data: createdProducts.map((p) => ({
            productID: p.id,
            name: null,
            price: p.price,
            stockQuantity: p.stockQuantity,
            isDefault: true,
            createdBy: user.userEmail,
          })),
        });
        await tx.productCategory.createMany({
          data: createdProducts.flatMap((p, i) =>
            resolveCategories(rows[i].categoryNames).map((categoryID: string) => ({
              productID: p.id,
              categoryID,
            })),
          ),
        });
        this.eventEmitter.emit('product.imported', { vendorID, count: createdProducts.length });
        return { count: createdProducts.length };
      });
    }
    const vendorNames = [...new Set(rows.map((r: any) => r.vendorName))] as string[];
    const vendors = await this.vendorService.client.findMany({
      where: { name: { in: vendorNames } },
      select: { id: true, name: true },
    });
    const vendorMap = new Map(vendors.map((v) => [v.name, v.id]));
    for (const name of vendorNames) {
      if (!vendorMap.has(name)) throw new BadRequestException(`Vendor "${name}" does not exist`);
    }
    const data = await this.prismaService.$transaction(async (tx) => {
      const createdProducts = await tx.product.createManyAndReturn({
        data: rows.map(({ vendorName, categoryNames: _cn, ...rest }: any) => ({
          ...rest,
          vendorID: vendorMap.get(vendorName)!,
          slug: this.stringUtilService.toSlug(rest.name),
          createdBy: user.userEmail,
        })),
      });
      await tx.productVariant.createMany({
        data: createdProducts.map((p) => ({
          productID: p.id,
          name: null,
          price: p.price,
          stockQuantity: p.stockQuantity,
          isDefault: true,
          createdBy: user.userEmail,
        })),
      });
      await tx.productCategory.createMany({
        data: createdProducts.flatMap((p, i) =>
          resolveCategories(rows[i].categoryNames).map((categoryID: string) => ({
            productID: p.id,
            categoryID,
          })),
        ),
      });
      return createdProducts;
    });
    const vendorCounts = data.reduce<Record<string, number>>((acc, p) => {
      acc[p.vendorID] = (acc[p.vendorID] ?? 0) + 1;
      return acc;
    }, {});
    for (const [vID, count] of Object.entries(vendorCounts)) {
      this.eventEmitter.emit('product.imported', { vendorID: vID, count });
    }
    return { count: data.length };
  }

  async deleteProduct(where: Prisma.ProductWhereUniqueInput & { vendorID?: Vendor['id'] }) {
    const { vendorID, ...uniqueWhere } = where;
    const product = await this.extended.findFirst({
      where: { id: uniqueWhere.id, ...(vendorID && { vendorID }) },
    });
    if (!product) throw new NotFoundException('Product not found');
    const data = await this.prismaService.$transaction(async (tx) => {
      const deletedProduct = await tx.product.updateMany({
        where: { id: uniqueWhere.id },
        data: { deletedAt: new Date() },
      });
      // Cascade soft-delete xuống variant con — tránh việc variant của product đã xóa vẫn mua được
      await tx.productVariant.updateMany({
        where: { productID: uniqueWhere.id },
        data: { deletedAt: new Date() },
      });
      // Cascade soft-delete xuống ảnh con — tránh ảnh "mồ côi" vẫn còn hiển thị ở nơi khác
      await tx.productImage.updateMany({
        where: { productID: uniqueWhere.id },
        data: { deletedAt: new Date() },
      });
      return deletedProduct;
    });
    this.eventEmitter.emit('product.deleted', { vendorID: product.vendorID });
    return data;
  }

  async verifyProductOwnership({
    productID,
    vendorID,
  }: {
    productID: Product['id'];
    vendorID: Vendor['id'];
  }) {
    const product = await this.extended.findFirst({
      where: { id: productID, vendorID },
    });
    if (!product)
      throw new NotFoundException('Product not found or does not belong to this vendor');
    return product;
  }

  async publishProduct({
    productID,
    vendorID,
  }: {
    productID: Product['id'];
    vendorID: Vendor['id'];
  }) {
    await this.verifyProductOwnership({ productID, vendorID });
    const [product, images, variants] = await Promise.all([
      this.extended.findFirst({ where: { id: productID }, include: { productCategories: true } }),
      this.prismaService.productImage.findFirst({ where: { productID } }),
      this.prismaService.productVariant.findMany({ where: { productID } }) as Promise<
        ProductVariant[]
      >,
    ]);
    const errors: string[] = [];
    if (!product?.productCategories?.length) {
      errors.push('Product must have at least one category');
    }
    if (!images) {
      errors.push('Product must have at least one image');
    }
    // Luôn có ít nhất 1 variant (ẩn hoặc thật) -> bỏ hẳn nhánh else cũ
    const realVariants = variants.filter((variant) => !variant.isDefault);
    if (realVariants.length > 0) {
      // Có variant thật -> check ảnh + stock như cũ, chỉ áp dụng cho variant thật
      const variantImages = await this.prismaService.productImage.findMany({
        where: { productVariantID: { in: realVariants.map((variant) => variant.id) } },
        select: { productVariantID: true },
      });
      const variantIDsWithImages = new Set(variantImages.map((img) => img.productVariantID));
      const variantsWithoutImage = realVariants.filter((v) => !variantIDsWithImages.has(v.id));
      if (variantsWithoutImage.length > 0) {
        errors.push(
          `These variants must have at least one image: ${variantsWithoutImage.map((variant) => variant.name ?? variant.id).join(', ')}`,
        );
      }
      const hasStock = realVariants.some((variant) => variant.stockQuantity > 0);
      if (!hasStock) {
        errors.push('At least one variant must have stock quantity greater than 0');
      }
    } else {
      // Chỉ có variant ẩn -> check stock của Product gốc (ảnh chung của Product đã check ở trên rồi)
      const defaultVariant = variants[0];
      if (!defaultVariant || defaultVariant.stockQuantity <= 0) {
        errors.push('Product must have stock quantity greater than 0');
      }
    }
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return this.extended.update({
      where: { id: productID },
      data: { status: ProductStatus.active },
    });
  }
}
