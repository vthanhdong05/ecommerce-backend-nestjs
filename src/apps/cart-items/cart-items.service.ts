import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { CartsService } from '../carts/carts.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartItemsService extends PrismaBaseService<'cartItem'> {
  constructor(
    public prismaService: PrismaService,
    private cartsService: CartsService,
  ) {
    super(prismaService, 'cartItem');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (Thêm item vào giỏ — nếu variant đã có trong giỏ thì cộng dồn quantity, không tạo trùng)
  async createCartItem({
    userID,
    productVariantID,
    quantity,
  }: {
    userID: string;
    productVariantID: string;
    quantity: number;
  }) {
    // Tái dùng CartsService.getOrCreateCart thay vì gọi prismaService.cart.upsert trực tiếp
    const cart = await this.cartsService.getOrCreateCart(userID);
    return this.client.upsert({
      where: { cartID_productVariantID: { cartID: cart.id, productVariantID } },
      create: { cartID: cart.id, productVariantID, quantity },
      update: { quantity: { increment: quantity } }, // cộng dồn thay vì ghi đè — đúng UX "thêm vào giỏ"
    });
  }

  // (Sửa quantity của 1 item — ghi đè, không cộng dồn)
  async updateCartItem({
    where,
    data: dataUpdate,
    userID,
  }: {
    where: Prisma.CartItemWhereUniqueInput;
    data: UpdateCartItemDto;
    userID: string;
  }) {
    const item = await this.client.findUnique({
      where,
      include: { cart: true },
    });
    if (!item || item.cart.userID !== userID) {
      throw new NotFoundException('CartItem not found');
    }
    return this.extended.update({ data: dataUpdate, where });
  }

  // (Xóa item khỏi giỏ — verify ownership trước)
  async deleteCartItem(where: Prisma.CartItemWhereUniqueInput, userID: string) {
    const item = await this.client.findUnique({
      where,
      include: { cart: true },
    });
    if (!item || item.cart.userID !== userID) {
      throw new NotFoundException('CartItem not found');
    }
    return this.client.delete({ where });
  }

  @OnEvent('order.created')
  async onOrderCreated({
    userID,
    productVariantIDs,
  }: {
    orderID: string;
    userID: string;
    vendorIDs: string[];
    productVariantIDs: string[];
  }) {
    // Lấy cart của user
    const cart = await this.cartsService.getOrCreateCart(userID);
    // Xóa đúng các CartItem đã đặt, giữ lại những item chưa đặt
    await this.prismaService.cartItem.deleteMany({
      where: {
        cartID: cart.id,
        productVariantID: { in: productVariantIDs },
      },
    });
  }
}
