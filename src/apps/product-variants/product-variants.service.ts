import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { parseAttributes } from 'src/common/utils/data-format/data-fomat.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import {
  CreateProductVariantDto,
  ImportProductVariantsDto,
} from './dto/create-product-variant.dto';
import {
  ExportProductVariantsDto,
  GetProductVariantsPaginationDto,
} from './dto/get-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantsService
  extends PrismaBaseService<'productVariant'>
  implements Options<ProductVariant>
{
  private productVariantEntityName = ProductVariant.name;
  private excelSheets = {
    [this.productVariantEntityName]: this.productVariantEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
    private productService: ProductsService,
  ) {
    super(prismaService, 'productVariant');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getProductVariant(
    where: Prisma.ProductVariantWhereUniqueInput & {
      productID?: Product['id'];
      vendorID?: string; // ← thêm
    },
  ) {
    const { productID, vendorID, ...uniqueWhere } = where;
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    return this.extended.findFirst({
      where: { ...uniqueWhere, ...(productID && { productID }) },
    });
  }

  async getProductVariants({
    page,
    itemPerPage,
    productID,
    vendorID,
  }: GetProductVariantsPaginationDto & { productID?: Product['id']; vendorID?: Vendor['id'] }) {
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const where = { ...(productID && { productID }) };
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

  async createProductVariant(
    createProductVariantDto: CreateProductVariantDto,
    user: UserInfo,
    vendorID?: Vendor['id'],
  ) {
    if (vendorID && createProductVariantDto.productID) {
      await this.productService.verifyProductOwnership({
        productID: createProductVariantDto.productID,
        vendorID,
      });
    }
    const data = await this.extended.create({
      data: {
        ...createProductVariantDto,
        user,
      } as any,
    });
    return data;
  }

  async updateProductVariant(params: {
    where: Prisma.ProductVariantWhereUniqueInput & {
      productID?: Product['id'];
      vendorID?: Vendor['id'];
    };
    data: UpdateProductVariantDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { productID, vendorID, ...uniqueWhere } = where;
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    if (productID) {
      const variant = await this.extended.findFirst({
        where: { id: uniqueWhere.id, productID },
      });
      if (!variant) throw new NotFoundException('ProductVariant not found');
    }
    return this.extended.update({ data: dataUpdate, where: uniqueWhere });
  }

  async getOptions(
    params: GetOptionsParams<Omit<ProductVariant, 'attributes'>> & {
      productID?: Product['id'];
      vendorID?: Vendor['id'];
    },
  ) {
    const { limit, select, vendorID, productID, ...searchFields } = params;
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);
    return this.extended.findMany({
      select: fieldsSelect,
      where: { ...searchFields, ...(productID && { productID }) },
      take: Number(limit),
    });
  }

  async exportProductVariants({
    ids,
    productID,
    vendorID,
  }: ExportProductVariantsDto & { productID?: Product['id']; vendorID?: Vendor['id'] }) {
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const [productVariants, allProducts] = await Promise.all([
      this.extended.export({
        where: {
          ...(ids && { id: { in: ids } }),
          ...(productID && { productID }),
        },
      }),
      this.productService.client.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const idToName = new Map<string, string>(
      allProducts.map((product) => [product.id, product.name]),
    );
    const mappedProductVariants = productVariants.map((variant) => {
      const mapped: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(variant)) {
        if (key === 'productID') {
          mapped['productName'] = value ? (idToName.get(value as string) ?? null) : null;
        } else {
          mapped[key] = value;
        }
      }
      return mapped;
    });
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productVariantEntityName],
          data: mappedProductVariants,
        },
      ],
    });
  }

  async importProductVariants({
    file,
    user,
    productID,
    vendorID,
  }: ImportProductVariantsDto & { productID?: Product['id']; vendorID?: Vendor['id'] }) {
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const sheetName = this.excelSheets[this.productVariantEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const rows = dataCreated[sheetName];
    if (productID) {
      return this.extended.createMany({
        data: rows.map(({ productName: _productName, attributes, ...rest }) => ({
          ...rest,
          productID,
          createdBy: user.userID,
          attributes: parseAttributes(attributes),
        })),
        skipDuplicates: true,
      });
    }
    const productNames = [...new Set(rows.map((r) => r.productName))] as string[];
    const products = await this.productService.client.findMany({
      where: { name: { in: productNames } },
      select: { id: true, name: true },
    });
    const nameToID = new Map<string, string>(products.map((p) => [p.name, p.id]));
    return this.extended.createMany({
      data: rows.map(({ productName, attributes, ...rest }) => {
        const resolvedProductID = nameToID.get(productName);
        if (!resolvedProductID) {
          throw new BadRequestException(`Product "${productName}" does not exist`);
        }
        return {
          ...rest,
          productID: resolvedProductID,
          createdBy: user.userID,
          attributes: parseAttributes(attributes),
        };
      }),
      skipDuplicates: true,
    });
  }

  async deleteProductVariant(
    where: Prisma.ProductVariantWhereUniqueInput & {
      productID?: Product['id'];
      vendorID?: Vendor['id'];
    },
  ) {
    const { productID, vendorID, ...uniqueWhere } = where;
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const variant = await this.extended.findFirst({
      where: { id: uniqueWhere.id, ...(productID && { productID }) },
    });
    if (!variant) throw new NotFoundException('ProductVariant not found');
    return this.extended.softDelete(uniqueWhere);
  }

  async verifyVariantOwnership({
    productVariantID,
    productID,
  }: {
    productVariantID: ProductVariant['id'];
    productID: Product['id'];
  }) {
    const variant = await this.extended.findFirst({
      where: {
        id: productVariantID,
        productID,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found or does not belong to this product');
    }
    return variant;
  }
}
