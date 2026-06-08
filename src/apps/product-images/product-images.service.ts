import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { UploadApiResponse } from 'cloudinary';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateProductImageDto, ImportProductImagesDto } from './dto/create-product-images.dto';
import { ExportProductImagesDto } from './dto/get-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-images.dto';
import { ProductImage } from './entities/product-images.entity';
import type { UploadProductImagePayload } from './interfaces/product-image.interface';

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
    private eventEmitter: EventEmitter2,
    private productService: ProductsService,
  ) {
    super(prismaService, 'productImage');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getProductImage(
    where: Prisma.ProductImageWhereInput & {
      vendorID?: Vendor['id'];
      productID?: Product['id'];
    },
  ) {
    const { vendorID, productID, ...uniqueWhere } = where;
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    return this.extended.findFirst({ where: uniqueWhere });
  }

  async getProductImages(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ProductImageWhereUniqueInput;
      where?: Prisma.ProductImageWhereInput;
      orderBy?: Prisma.ProductImageOrderByWithRelationInput;
      vendorID?: Vendor['id'];
      productID?: Product['id'];
    } = {},
  ) {
    const { skip, take, cursor, where, orderBy, vendorID, productID } = params;

    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    return this.extended.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProductImage(createProductImageDto: CreateProductImageDto, vendorID?: Vendor['id']) {
    if (vendorID && createProductImageDto.productID) {
      await this.productService.verifyProductOwnership({
        productID: createProductImageDto.productID,
        vendorID,
      });
    }
    return this.extended.create({
      data: createProductImageDto,
    });
  }

  // Verify image thuộc product của vendor
  async verifyImageOwnership({ imageID, vendorID }: { imageID: string; vendorID: Vendor['id'] }) {
    const image = await this.extended.findFirst({
      where: {
        id: imageID,
        OR: [
          {
            product: { vendorID }, // ← ảnh product
          },
          {
            productVariant: {
              product: { vendorID }, // ← ảnh variant
            },
          },
        ],
      },
    });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async updateProductImage(params: {
    where: Prisma.ProductImageWhereUniqueInput & { vendorID?: Vendor['id'] };
    data: UpdateProductImageDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { vendorID, ...uniqueWhere } = where;
    if (vendorID)
      await this.verifyImageOwnership({
        imageID: uniqueWhere.id as string,
        vendorID,
      });
    return this.extended.update({ data: dataUpdate, where: uniqueWhere });
  }

  async deleteProductImage(
    where: Prisma.ProductImageWhereUniqueInput & { vendorID?: Vendor['id'] },
  ) {
    const { vendorID, ...uniqueWhere } = where;
    if (vendorID)
      await this.verifyImageOwnership({
        imageID: uniqueWhere.id as string,
        vendorID,
      });
    return this.extended.softDelete(uniqueWhere);
  }

  async exportProductImages({
    ids,
    vendorID,
    productID,
  }: ExportProductImagesDto & {
    vendorID?: Vendor['id'];
    productID?: Product['id'];
  }) {
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const productImages = await this.extended.export({
      where: {
        ...(ids && { id: { in: ids } }),
        ...(productID && { productID }),
      },
    });
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.productImageEntityName],
          data: productImages,
        },
      ],
    });
  }

  async importProductImages({
    file,
    user,
    vendorID,
    productID,
  }: ImportProductImagesDto & {
    vendorID?: Vendor['id'];
    productID?: Product['id'];
  }) {
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
    }
    const productImageSheetName = this.excelSheets[this.productImageEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    return this.extended.createMany({
      data: dataCreated[productImageSheetName].map((item) => ({
        ...item,
        ...(productID && { productID }),
        user,
      })),
    });
  }

  uploadProductImages({
    files,
    user,
    productID,
    productVariantID,
    vendorID,
  }: {
    files: Express.Multer.File[];
    user: UserInfo;
    productID?: Product['id'];
    productVariantID?: ProductVariant['id'];
    vendorID?: Vendor['id'];
  }) {
    for (const file of files) {
      this.eventEmitter.emit('product-images.upload', {
        file,
        user,
        productID,
        productVariantID,
        vendorID,
      });
    }
    return { message: 'Upload received, processing in background' };
  }

  @OnEvent('product-images.upload')
  async uploadProductImagesEvent(payload: UploadProductImagePayload) {
    const { file, user, productID, productVariantID, vendorID } = payload;
    // Verify product thuộc vendor trước khi upload
    if (vendorID && productID) {
      await this.productService.verifyProductOwnership({ productID, vendorID });
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
