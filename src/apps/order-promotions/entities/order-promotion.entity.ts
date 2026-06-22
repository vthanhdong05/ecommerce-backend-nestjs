import { OrderPromotion as OrderPromotionPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderPromotion implements OrderPromotionPrisma {
  id!: string;
  orderID!: string;
  promotionID!: string;
  discountAmount!: Decimal;
}
