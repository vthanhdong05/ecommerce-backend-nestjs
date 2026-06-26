import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UploadApiResponse } from 'cloudinary';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { ProductVariantsService } from '../product-variants/product-variants.service';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateProductImageDto, ImportProductImagesDto } from './dto/create-product-images.dto';
import { ExportProductImagesDto } from './dto/get-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-images.dto';
import { ProductImage } from './entities/product-images.entity';

@Injectable()
export class ProductImagesService extends PrismaBaseService<'productImage'> {
  private productImageEntityName = ProductImage.name;
  private excelSheets = {
    [this.productImageEntityName]: this.productImageEntityName,
  };
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
    private fileUtilService: FileUtilService,
    private productService: ProductsService,
    private productVariantService: ProductVariantsService,
  ) {
    super(prismaService, 'productImage');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getProductImage(productImageWhereUniqueInput: Prisma.ProductImageWhereInput) {
    const data = await this.extended.findFirst({
      where: productImageWhereUniqueInput,
    });
    return data;
  }

  // (getProductImages filter theo productID/productVariantID)
  async getProductImagesByProduct(
    params: {
      productID?: Product['id'];
      productVariantID?: ProductVariant['id'];
      vendorID?: Vendor['id'];
    } = {},
  ) {
    const { productID, productVariantID, vendorID } = params;
    // Nếu có vendorID + productID thì check product thuộc vendor
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    // Nếu có productID + productVariantID thì check variant thuộc product
    if (productID && productVariantID) {
      await this.productVariantService.verifyVariantOwnership({ productVariantID, productID });
    }
    return this.extended.findMany({
      where: {
        ...(productID && { productID }),
        ...(productVariantID && { productVariantID }),
      },
    });
  }

  async getProductImages(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ProductImageWhereUniqueInput;
      where?: Prisma.ProductImageWhereInput;
      orderBy?: Prisma.ProductImageOrderByWithRelationInput;
    } = {},
  ) {
    const { skip, take, cursor, where, orderBy } = params;
    const data = await this.extended.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    return data;
  }

  async createProductImage(createProductImageDto: CreateProductImageDto) {
    const data = await this.extended.create({
      data: createProductImageDto,
    });
    return data;
  }

  // (Verify image thuộc product của vendor)
  async verifyImageOwnership({
    imageID,
    vendorID,
    productID,
  }: {
    imageID: string;
    vendorID?: Vendor['id'];
    productID?: Product['id'];
  }) {
    const image = await this.extended.findFirst({
      where: {
        id: imageID,
        OR: [
          {
            product: { vendorID, ...(productID && { id: productID }) },
          },
          {
            productVariant: {
              product: { vendorID, ...(productID && { id: productID }) },
            },
          },
        ],
      },
    });
    if (!image) {
      throw new NotFoundException('Image not found or does not belong to this vendor/product');
    }
    return image;
  }

  async updateProductImage(params: {
    where: Prisma.ProductImageWhereUniqueInput & {
      vendorID?: Vendor['id'];
      productID?: Product['id'];
      productVariantID?: ProductVariant['id'];
    };
    data: UpdateProductImageDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { vendorID, productID, productVariantID, ...uniqueWhere } = where;
    if (vendorID) {
      await this.verifyImageOwnership({
        imageID: uniqueWhere.id as string,
        vendorID,
        productID,
      });
    }
    if (productID && productVariantID) {
      await this.productVariantService.verifyVariantOwnership({ productVariantID, productID });
    }
    return this.extended.update({ data: dataUpdate, where: uniqueWhere });
  }

  async deleteProductImage(
    where: Prisma.ProductImageWhereUniqueInput & {
      vendorID?: Vendor['id'];
      productID?: Product['id'];
      productVariantID?: ProductVariant['id'];
    },
  ) {
    const { vendorID, productID, productVariantID, ...uniqueWhere } = where;

    if (vendorID) {
      await this.verifyImageOwnership({
        imageID: uniqueWhere.id as string,
        vendorID,
        productID,
      });
    }
    if (productID && productVariantID) {
      await this.productVariantService.verifyVariantOwnership({ productVariantID, productID });
    }
    return this.extended.softDelete(uniqueWhere);
  }

  async exportProductImages({ ids }: ExportProductImagesDto) {
    const productImages = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productImageEntityName],
          data: productImages,
        },
      ],
    });
    return data;
  }

  async importProductImages({ file, user }: ImportProductImagesDto) {
    const productImageSheetName = this.excelSheets[this.productImageEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const data = await this.extended.createMany({
      data: dataCreated[productImageSheetName].map((item) => ({
        ...item,
        user,
      })),
    });
    return data;
  }

  async uploadProductImage({
    file,
    user,
    productID,
    productVariantID,
    vendorID,
  }: {
    file: Express.Multer.File;
    user: UserInfo;
    productID?: Product['id'];
    productVariantID?: ProductVariant['id'];
    vendorID?: Vendor['id'];
  }) {
    // Verify ownership
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    if (productID && productVariantID) {
      await this.productVariantService.verifyVariantOwnership({ productVariantID, productID });
    }

    const fileName = this.fileUtilService.removeFileExtension(file.originalname);
    const productImageExist = await this.getProductImage({ name: fileName });
    if (productImageExist) {
      await this.fileUtilService.removeImage(file);
    }

    const { url, secure_url, display_name, created_at } =
      await this.fileUtilService.uploadImage<UploadApiResponse>(file);

    const dataUpsert = {
      name: display_name,
      description: display_name,
      imageUrl: secure_url ?? url,
      ...(productID && { productID }),
      ...(productVariantID && { productVariantID }),
      user,
    };

    return this.extended.upsert({
      create: { ...dataUpsert, createdAt: created_at },
      update: { ...dataUpsert },
      where: { id: productImageExist?.id ?? '' },
    });
  }
}
