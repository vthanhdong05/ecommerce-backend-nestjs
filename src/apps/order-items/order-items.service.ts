import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Injectable()
export class OrderItemsService extends PrismaBaseService<'orderItem'> {
  constructor(public prismaService: PrismaService) {
    super(prismaService, 'orderItem');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getOrderItem({
    id,
    userID,
    vendorID,
  }: {
    id: string;
    userID?: string; // nếu gọi với tư cách User
    vendorID?: string; // nếu gọi với tư cách Vendor
  }) {
    const data = await this.extended.findFirst({
      where: {
        id,
        ...(userID && { order: { userID } }),
        ...(vendorID && { vendorID }),
      },
    });
    if (!data) throw new NotFoundException('Order item not found');
    return data;
  }

  async createOrderItem(
    { orderID, productVariantID, quantity }: CreateOrderItemDto,
    tx: Prisma.TransactionClient,
  ) {
    const variant = await tx.productVariant.findUnique({
      where: { id: productVariantID },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException(`Product variant ${productVariantID} not found`);
    }
    if (variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `${variant.product.name}${variant.name ? ` (${variant.name})` : ''} is out of stock`,
      );
    }

    const unitPrice = variant.price;
    const totalPrice = Number(unitPrice) * quantity;

    const [orderItem] = await Promise.all([
      tx.orderItem.create({
        data: {
          orderID,
          vendorID: variant.product.vendorID,
          productVariantID,
          quantity,
          unitPrice,
          totalPrice,
          productVariantSnapshot: {
            productVariantID: variant.id,
            productID: variant.product.id,
            productName: variant.product.name,
            variantName: variant.name,
            sku: variant.sku,
            price: unitPrice.toString(),
            attributes: variant.attributes as Record<string, unknown> | null,
          },
        },
      }),
      tx.productVariant.update({
        where: { id: productVariantID },
        data: { stockQuantity: { decrement: quantity } },
      }),
    ]);

    return orderItem;
  }
}
