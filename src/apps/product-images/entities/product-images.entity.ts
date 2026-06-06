import { ProductImage as ProductImagePrisma } from '@prisma/client';

export class ProductImage implements ProductImagePrisma {
  name!: string;
  id!: string;
  description!: string | null;
  productID!: string | null;
  productVariantID!: string | null;
  imageUrl!: string;
  sortOrder!: number;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
