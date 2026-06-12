import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ProductStatus } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
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
      where: {
        ...uniqueWhere,
        ...(vendorID && { vendorID }),
      },
    });
    return data;
  }

  async getProducts({
    page,
    itemPerPage,
    vendorID,
  }: GetProductsPaginationDto & { vendorID?: Vendor['id'] }) {
    const where = { ...(vendorID && { vendorID }) };

    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
    });
    return paging.format(list);
  }

  async createProduct(createProductDto: CreateProductDto, user: UserInfo) {
    const { categoryIDs, ...productData } = createProductDto;
    const data = await this.extended.create({
      data: {
        ...productData,
        user,
        productCategories: {
          create: categoryIDs.map((categoryID) => ({ categoryID })),
        },
      } as any,
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
    const data = await this.extended.update({
      data: dataUpdate,
      where: uniqueWhere,
    });
    return data;
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
          ...(vendorID && { vendorID }), // ← filter theo vendor
        },
      }),
      this.vendorService.client.findMany({
        select: { id: true, name: true },
      }),
    ]);
    const idToName = new Map<string, string>(allVendors.map((vendor) => [vendor.id, vendor.name]));
    const mappedProducts = products.map((product) => {
      const mapped: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(product)) {
        if (key === 'vendorID') {
          mapped['vendorName'] = value ? (idToName.get(value as string) ?? null) : null;
        } else {
          mapped[key] = value;
        }
      }
      return mapped;
    });
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productEntityName],
          data: mappedProducts,
        },
      ],
    });
  }

  // (Admin phải có cột vendorName)
  // (Vendor không cần cột VendorName gán thẳng vendorID từ URL)
  async importProducts({ file, user, vendorID }: ImportProductsDto & { vendorID?: Vendor['id'] }) {
    const productSheetName = this.excelSheets[this.productEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const rows = dataCreated[productSheetName];
    if (vendorID) {
      const data = await this.extended.createMany({
        data: rows.map(({ vendorName: _vendorName, ...rest }) => ({
          ...rest,
          vendorID,
          user,
        })),
      });
      // emit 1 lần với count
      this.eventEmitter.emit('product.imported', { vendorID, count: data.count });
      return data;
    }
    const vendorNames = [...new Set(rows.map((r) => r.vendorName))] as string[];
    const vendors = await this.vendorService.client.findMany({
      where: { name: { in: vendorNames } },
      select: { id: true, name: true },
    });
    const vendorMap = new Map(vendors.map((v) => [v.name, v.id]));
    const mappedRows = rows.map(({ vendorName, ...rest }) => {
      const vendorID = vendorMap.get(vendorName);
      if (!vendorID) throw new BadRequestException(`Vendor "${vendorName}" does not exist`);
      return { ...rest, vendorID, user };
    });
    const data = await this.extended.createMany({ data: mappedRows });
    // Emit theo từng vendor
    const vendorCounts = mappedRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.vendorID] = (acc[row.vendorID] ?? 0) + 1;
      return acc;
    }, {});
    for (const [vID, count] of Object.entries(vendorCounts)) {
      this.eventEmitter.emit('product.imported', { vendorID: vID, count });
    }
    return data;
  }

  async deleteProduct(where: Prisma.ProductWhereUniqueInput & { vendorID?: Vendor['id'] }) {
    const { vendorID, ...uniqueWhere } = where;
    const product = await this.extended.findFirst({
      where: { id: uniqueWhere.id, ...(vendorID && { vendorID }) },
    });
    if (!product) throw new NotFoundException('Product not found');
    const data = await this.extended.softDelete(uniqueWhere);
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
      this.prismaService.productVariant.findMany({ where: { productID } }),
    ]);
    const errors: string[] = [];
    if (!product?.productCategories?.length) {
      errors.push('Product must have at least one category');
    }
    if (!images) {
      errors.push('Product must have at least one image');
    }
    if (variants.length > 0) {
      // Check từng variant đều phải có ít nhất 1 ảnh
      const variantImages = await this.prismaService.productImage.findMany({
        where: { productVariantID: { in: variants.map((v) => v.id) } },
        select: { productVariantID: true },
      });
      const variantIDsWithImages = new Set(variantImages.map((img) => img.productVariantID));
      const variantsWithoutImage = variants.filter((v) => !variantIDsWithImages.has(v.id));
      if (variantsWithoutImage.length > 0) {
        errors.push(
          `These variants must have at least one image: ${variantsWithoutImage.map((v) => v.name ?? v.id).join(', ')}`,
        );
      }
      const hasStock = variants.some((v) => v.stockQuantity > 0);
      if (!hasStock) {
        errors.push('At least one variant must have stock quantity greater than 0');
      }
    } else {
      if (!product?.stockQuantity || product.stockQuantity <= 0) {
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
