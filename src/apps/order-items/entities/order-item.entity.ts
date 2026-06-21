import { OrderItem as OrderItemPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderItem implements OrderItemPrisma {
  id!: string;
  orderID!: string;
  vendorID!: string;
  productVariantID!: string;
  quantity!: number;
  unitPrice!: Decimal;
  totalPrice!: Decimal;
  productVariantSnapshot!: PrismaJson.ProductVariantSnapshotType | null;
}
