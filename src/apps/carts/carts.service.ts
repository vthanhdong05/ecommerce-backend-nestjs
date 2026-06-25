import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';

@Injectable()
export class CartsService extends PrismaBaseService<'cart'> {
  constructor(public prismaService: PrismaService) {
    super(prismaService, 'cart');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (Lấy cart kèm CartItem + thông tin ProductVariant để hiển thị giỏ hàng)
  async getCart(userID: string) {
    return this.extended.findUnique({
      where: { userID },
      include: {
        cartItems: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });
  }

  // (Lấy hoặc tạo mới Cart nếu user chưa có — dùng upsert để atomic, không race condition)
  async getOrCreateCart(userID: string) {
    return this.extended.upsert({
      where: { userID },
      create: { userID } as any,
      update: {}, // không update gì, chỉ trả về cart đã có
    });
  }

  // (Xóa hết CartItem sau khi checkout thành công — Cart vẫn giữ nguyên)
  async clearCart(userID: string) {
    const cart = await this.extended.findUnique({ where: { userID } });
    if (!cart) return null;
    return this.prismaService.cartItem.deleteMany({
      where: { cartID: cart.id },
    });
  }
}
