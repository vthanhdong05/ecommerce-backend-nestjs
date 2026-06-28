import { $Enums, Promotion as PromotionPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Promotion implements PromotionPrisma {
  name!: string;
  id!: string;
  code!: string;
  description!: string | null;
  type!: $Enums.PromotionType;
  scope!: $Enums.PromotionScope;
  value!: Decimal;
  minQuantity!: number | null;
  usageLimit!: number | null;
  startDate!: Date;
  endDate!: Date | null;
  status!: $Enums.PromotionStatus;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
