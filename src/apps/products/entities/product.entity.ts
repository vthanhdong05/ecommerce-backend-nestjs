import { $Enums, Product as ProductPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Product implements ProductPrisma {
  name!: string;
  id!: string;
  vendorID!: string;
  slug!: string;
  description!: string | null;
  sku!: string | null;
  price!: Decimal;
  stockQuantity!: number;
  status!: $Enums.ProductStatus;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
