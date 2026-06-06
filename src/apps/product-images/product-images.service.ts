import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { UploadApiResponse } from 'cloudinary';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { FileUtilService } from '../../common/utils/file-util/file-util.service';
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

  // Verify image thuộc product của vendor
  async verifyImageOwnership({ imageID, vendorID }: { imageID: string; vendorID: string }) {
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
    where: Prisma.ProductImageWhereUniqueInput & { vendorID?: string };
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

  async deleteProductImage(where: Prisma.ProductImageWhereUniqueInput & { vendorID?: string }) {
    const { vendorID, ...uniqueWhere } = where;
    if (vendorID)
      await this.verifyImageOwnership({
        imageID: uniqueWhere.id as string,
        vendorID,
      });
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

  uploadProductImages({
    files,
    user,
    productID,
    productVariantID,
  }: {
    files: Express.Multer.File[];
    user: UserInfo;
    productID?: string;
    productVariantID?: string;
  }) {
    for (const file of files) {
      this.eventEmitter.emit('product-images.upload', {
        file,
        user,
        productID,
        productVariantID,
      });
    }
    return { message: 'Upload received, processing in background' };
  }

  @OnEvent('product-images.upload')
  async uploadProductImagesEvent(payload: UploadProductImagePayload) {
    const { file, user, productID, productVariantID } = payload;
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
      ...(productID && { productID }), // ← thêm
      ...(productVariantID && { productVariantID }), // ← thêm
      user,
    };
    return this.extended.upsert({
      create: { ...dataUpsert, createdAt: created_at },
      update: { ...dataUpsert },
      where: { id: productImageExist?.id ?? '' },
    });
  }
}
