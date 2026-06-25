import { CartItem as CartItemPrisma } from '@prisma/client';

export class CartItem implements CartItemPrisma {
  id!: string;
  cartID!: string;
  productVariantID!: string;
  quantity!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
