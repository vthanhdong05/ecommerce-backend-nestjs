import { $Enums, Order as OrderPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Order implements OrderPrisma {
  id!: string;
  orderNumber!: string;
  userID!: string;
  status!: $Enums.OrderStatus;
  subtotal!: Decimal;
  taxAmount!: Decimal;
  shippingAmount!: Decimal;
  discountAmount!: Decimal;
  totalAmount!: Decimal;
  currency!: string;
  notes!: string | null;
  shippedAt!: Date | null;
  deliveredAt!: Date | null;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
