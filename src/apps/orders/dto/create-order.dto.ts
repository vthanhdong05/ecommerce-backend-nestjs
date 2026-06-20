import { $Enums, Prisma } from '@prisma/client';
import { DecimalJsLike } from '@prisma/client/runtime/library';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

class CreateOrderDto implements Prisma.OrderCreateInput {
  id?: string | undefined;
  orderNumber!: string;
  status?: $Enums.OrderStatus | undefined;
  subtotal!: string | number | Prisma.Decimal | DecimalJsLike;
  taxAmount?: string | number | Prisma.Decimal | DecimalJsLike | undefined;
  shippingAmount?: string | number | Prisma.Decimal | DecimalJsLike | undefined;
  discountAmount?: string | number | Prisma.Decimal | DecimalJsLike | undefined;
  totalAmount!: string | number | Prisma.Decimal | DecimalJsLike;
  currency?: string | undefined;
  notes?: string | null | undefined;
  shippedAt?: string | Date | null | undefined;
  deliveredAt?: string | Date | null | undefined;
  createdAt?: string | Date | undefined;
  createdBy?: string | null | undefined;
  updatedAt?: string | Date | undefined;
  deletedAt?: string | Date | null | undefined;
  user!: Prisma.UserCreateNestedOneWithoutOrdersInput;
  // orderItems?: Prisma.OrderItemCreateNestedManyWithoutOrderInput | undefined;
  // orderAddresses?:
  //   | Prisma.OrderAddressCreateNestedManyWithoutOrderInput
  //   | undefined;
  // orderPromotions?:
  //   | Prisma.OrderPromotionCreateNestedManyWithoutOrderInput
  //   | undefined;
}

class ImportOrdersDto extends ImportExcel {}

export { CreateOrderDto, ImportOrdersDto };
