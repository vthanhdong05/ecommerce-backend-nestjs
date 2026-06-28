import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderItem, OrderStatus, Prisma } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { OrderAddressesService } from '../order-addresses/order-addresses.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderPromotionsService } from '../order-promotions/order-promotions.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ALLOWED_VENDOR_STATUS_TRANSITIONS } from './const/order-status-transition.const';
import { CreateOrderDto } from './dto/create-order.dto';
import { ExportOrdersDto, GetOrdersPaginationDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService extends PrismaBaseService<'order'> {
  private orderEntityName = Order.name;
  private excelSheets = {
    [this.orderEntityName]: this.orderEntityName,
  };

  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private stringUtilService: StringUtilService,
    private orderItemsService: OrderItemsService,
    private orderAddressesService: OrderAddressesService,
    private eventEmitter: EventEmitter2,
    private promotionsService: PromotionsService,
    private orderPromotionsService: OrderPromotionsService,
  ) {
    super(prismaService, 'order');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (User xem đơn của chính mình — bắt buộc check ownership)
  async getOrder({ id, userID }: { id: string; userID: string }) {
    const data = await this.extended.findFirst({
      where: { id, userID },
      include: { orderItems: true, orderAddresses: true },
    });
    if (!data) throw new NotFoundException('Order not found');
    return data;
  }

  // (Vendor xem 1 đơn — chỉ thấy items thuộc vendor mình)
  async getVendorOrder({ id, vendorID }: { id: string; vendorID: string }) {
    const data = await this.extended.findFirst({
      where: { id, orderItems: { some: { vendorID } } },
      include: { orderItems: { where: { vendorID } } },
    });
    if (!data) throw new NotFoundException('Order not found');
    return data;
  }

  async getOrders({ page, itemPerPage, userID }: GetOrdersPaginationDto & { userID: string }) {
    const where = { userID };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
    });
    return paging.format(list);
  }

  async getVendorOrders({
    vendorID,
    page,
    itemPerPage,
  }: GetOrdersPaginationDto & { vendorID: string }) {
    const where: Prisma.OrderWhereInput = { orderItems: { some: { vendorID } } };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      include: { orderItems: { where: { vendorID } } },
    });
    return paging.format(list);
  }

  async createOrder(createOrderDto: CreateOrderDto, user: UserInfo) {
    const { items, shippingAddress, promotionCode, shippingPromotionCode, notes } = createOrderDto;
    const { order, orderItems } = await this.prismaService.$transaction(async (tx) => {
      // 1. Tạo Order rỗng trước (chưa biết tổng tiền), để có orderID gắn cho item/address
      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userID: user.userID,
          status: OrderStatus.pending,
          subtotal: 0,
          totalAmount: 0,
          notes,
          createdBy: user.userEmail,
        },
      });
      // 2. Tạo từng OrderItem — tự validate stock, tự tính giá, tự trừ kho (throw lỗi -> rollback toàn bộ)
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const orderItem = await this.orderItemsService.createOrderItem(
          {
            orderID: newOrder.id,
            productVariantID: item.productVariantID,
            quantity: item.quantity,
          },
          tx,
        );
        orderItems.push(orderItem);
      }
      // 3. Resolve địa chỉ giao hàng — dùng body nếu có, không thì fallback User profile
      const resolvedAddress =
        shippingAddress ?? (await this.resolveAddressFromUserProfile(user.userID, tx));
      await this.orderAddressesService.createOrderAddress(
        { orderID: newOrder.id, type: 'shipping', ...resolvedAddress },
        tx,
      );
      // 4. Tính subtotal từ các OrderItem vừa tạo
      const subtotal = orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      let discountAmount = 0;
      const shippingAmount = 0; // TODO: tính phí ship thật khi có Shipping module
      // 5. Validate + áp dụng mã giảm giá đơn hàng (scope: ORDER)
      if (promotionCode) {
        const result = await this.promotionsService.validateAndCalculateDiscount(
          promotionCode,
          subtotal,
          tx,
          totalQuantity,
        );
        discountAmount += result.discountAmount;
        await this.orderPromotionsService.createOrderPromotion(
          {
            orderID: newOrder.id,
            promotionID: result.promotionID,
            discountAmount: result.discountAmount,
          },
          tx,
        );
      }
      // 6. Validate + áp dụng mã giảm phí ship (scope: SHIPPING)
      if (shippingPromotionCode) {
        const result = await this.promotionsService.validateAndCalculateDiscount(
          shippingPromotionCode,
          shippingAmount, // base là phí ship, không phải subtotal
          tx,
          totalQuantity,
        );
        discountAmount += result.discountAmount;
        await this.orderPromotionsService.createOrderPromotion(
          {
            orderID: newOrder.id,
            promotionID: result.promotionID,
            discountAmount: result.discountAmount,
          },
          tx,
        );
      }
      // 7. Tính totalAmount cuối cùng — Math.max(0) tránh số âm khi discount > subtotal
      const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);

      const updatedOrder = await tx.order.update({
        where: { id: newOrder.id },
        data: { subtotal, shippingAmount, discountAmount, totalAmount },
      });

      return { order: updatedOrder, orderItems };
    });

    // 8. Sau khi transaction commit thành công — emit event cho các việc phụ
    const vendorIDs = [...new Set(orderItems.map((item) => item.vendorID))];
    const productVariantIDs = orderItems.map((item) => item.productVariantID);
    this.eventEmitter.emit('order.created', {
      orderID: order.id,
      userID: user.userID,
      vendorIDs,
      productVariantIDs,
    });
    return order;
  }
  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD-${datePart}-${this.stringUtilService.random(6).toUpperCase()}`;
  }
  private async resolveAddressFromUserProfile(userID: string, tx: Prisma.TransactionClient) {
    const user = await tx.user.findUnique({ where: { id: userID } });
    if (!user?.fullAddress || !user?.phone) {
      throw new BadRequestException(
        'Please provide a shipping address or update your profile address',
      );
    }
    return {
      firstName: user.firstName ?? '',
      lastName: user.lastName,
      fullAddress: user.fullAddress,
      city: user.city,
      province: user.province,
      country: user.country,
      phone: user.phone,
    };
  }

  // (User tự sửa — chỉ cho phép sửa notes, có ownership check)
  async updateOrder({ id, userID, data }: { id: string; userID: string; data: UpdateOrderDto }) {
    const order = await this.extended.findFirst({ where: { id, userID } });
    if (!order) throw new NotFoundException('Order not found');
    return this.extended.update({ where: { id }, data });
  }

  // (Vendor cập nhật status — theo đúng state machine, không nhảy cóc)
  async updateVendorOrderStatus({
    id,
    vendorID,
    status,
  }: {
    id: string;
    vendorID: string;
    status: OrderStatus;
  }) {
    const order = await this.extended.findFirst({
      where: { id, orderItems: { some: { vendorID } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    const allowedNextStatuses = ALLOWED_VENDOR_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowedNextStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from "${order.status}" to "${status}"`,
      );
    }
    const updateData: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.shipped) updateData.shippedAt = new Date();
    if (status === OrderStatus.delivered) updateData.deliveredAt = new Date();
    return this.extended.update({ where: { id }, data: updateData });
  }

  // (Hủy đơn — chỉ khi pending/confirmed, hoàn lại kho)
  async cancelOrder({ id, userID }: { id: string; userID: string }) {
    const order = await this.extended.findFirst({
      where: { id, userID },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const cancellableStatuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.confirmed];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Cannot cancel an order with status "${order.status}"`);
    }
    return this.prismaService.$transaction(async (tx) => {
      // Hoàn lại stock cho từng item
      for (const item of order.orderItems) {
        await tx.productVariant.update({
          where: { id: item.productVariantID },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.cancelled },
      });
    });
  }

  async exportOrders({ ids }: ExportOrdersDto) {
    const orders = await this.extended.export({ where: { id: { in: ids } } });
    return this.excelUtilService.generateExcel({
      worksheets: [{ sheetName: this.excelSheets[this.orderEntityName], data: orders }],
    });
  }
}
