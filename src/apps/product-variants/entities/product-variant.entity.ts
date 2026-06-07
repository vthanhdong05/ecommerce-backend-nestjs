import { ProductVariant as ProductVariantPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductVariant implements ProductVariantPrisma {
  name: string | null;
  id: string;
  productID: string;
  sku: string | null;
  price: Decimal;
  stockQuantity: number;
  attributes: unknown;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  deletedAt: Date | null;
}
