import { ProductCategory as ProductCategoryPrisma } from '@prisma/client';

export class ProductCategory implements ProductCategoryPrisma {
  productID!: string;
  categoryID!: string;
  createdAt!: Date;
  createdBy!: string | null;
}
