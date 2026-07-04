import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderItem, OrderStatus, Prisma, PromotionScope } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { MailUtilService } from 'src/common/utils/mail-util/mail-util.service';
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
import { SHIPPING_FEE_PER_VENDOR } from './const/shipping.const';
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
  private readonly logger = new Logger(OrdersService.name);

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
    private mailUtilService: MailUtilService,
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
      const vendorCount = new Set(orderItems.map((item) => item.vendorID)).size;
      let discountAmount = 0;
      const shippingAmount = vendorCount * SHIPPING_FEE_PER_VENDOR;
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
          shippingAmount,
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
    // Gửi mail xác nhận đơn hàng
    try {
      const userEmail = user.userEmail;
      await this.mailUtilService.sendMail({
        to: userEmail,
        subject: `Đơn hàng ${order.orderNumber} đã được tạo thành công`,
        template: 'order-created',
        context: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt.toLocaleString('vi-VN'),
        },
      });
    } catch {
      this.logger.warn(`Failed to send order confirmation email for order ${order.orderNumber}`);
    }
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

  async cancelOrderItemsByVendor({ id, vendorID }: { id: string; vendorID: string }) {
    const order = await this.extended.findFirst({
      where: { id, orderItems: { some: { vendorID } } },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const cancellableStatuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.confirmed];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel items for an order with status "${order.status}"`,
      );
    }
    const vendorItems = order.orderItems.filter((item) => item.vendorID === vendorID);
    const remainingItems = order.orderItems.filter((item) => item.vendorID !== vendorID);
    return this.prismaService.$transaction(async (tx) => {
      // 1. Hoàn lại stock cho từng item của vendor
      for (const item of vendorItems) {
        await tx.productVariant.update({
          where: { id: item.productVariantID },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
      // 2. Xóa OrderItem của vendor
      await tx.orderItem.deleteMany({
        where: { orderID: id, vendorID },
      });
      // 3. Nếu không còn item nào → cancel toàn bộ Order
      if (remainingItems.length === 0) {
        return tx.order.update({
          where: { id },
          data: { status: OrderStatus.cancelled, totalAmount: 0, subtotal: 0 },
        });
      }
      // 4. Tính lại shipping dựa trên vendor còn lại
      const originalSubtotal = Number(order.subtotal);
      const newSubtotal = remainingItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      const newVendorCount = new Set(remainingItems.map((item) => item.vendorID)).size;
      const newShippingAmount = newVendorCount * SHIPPING_FEE_PER_VENDOR;
      // 5. Lấy discount SHIPPING đã áp (nếu có)
      const orderShippingPromotion = await tx.orderPromotion.findFirst({
        where: {
          orderID: id,
          promotion: { scope: PromotionScope.SHIPPING },
        },
        include: { promotion: true },
      });
      // 6. Validate discount SHIPPING không vượt quá shipping mới
      let shippingDiscount = 0;
      if (orderShippingPromotion) {
        shippingDiscount = Math.min(
          Number(orderShippingPromotion.discountAmount),
          newShippingAmount,
        );
        if (shippingDiscount !== Number(orderShippingPromotion.discountAmount)) {
          await tx.orderPromotion.update({
            where: { id: orderShippingPromotion.id },
            data: { discountAmount: shippingDiscount },
          });
        }
      }
      // 7. Tính lại totalDiscount và totalAmount
      const discountOrderRatio =
        originalSubtotal > 0 ? Number(order.discountAmount) / originalSubtotal : 0;
      const newDiscountOrder = Math.min(Math.round(newSubtotal * discountOrderRatio), newSubtotal);
      const newDiscountAmount = newDiscountOrder + shippingDiscount;
      const newTotalAmount = Math.max(0, newSubtotal + newShippingAmount - newDiscountAmount);
      // Gửi mail thông báo khi vendor hủy item
      try {
        const orderWithUser = await this.prismaService.order.findUnique({
          where: { id },
          include: { user: { select: { email: true, firstName: true } } },
        });

        if (orderWithUser?.user?.email) {
          await this.mailUtilService.sendMail({
            to: orderWithUser.user.email,
            subject: `Cập nhật đơn hàng ${orderWithUser.orderNumber} - Có sản phẩm bị hủy`,
            template: 'order-item-cancelled',
            context: {
              orderNumber: orderWithUser.orderNumber,
              cancelledItemsCount: vendorItems.length,
              newTotalAmount: newTotalAmount,
              updatedAt: new Date().toLocaleString('vi-VN'),
            },
          });
        }
      } catch {
        this.logger.warn(`Failed to send cancellation email for order ${id}`);
      }
      return tx.order.update({
        where: { id },
        data: {
          subtotal: newSubtotal,
          shippingAmount: newShippingAmount,
          discountAmount: newDiscountAmount,
          totalAmount: newTotalAmount,
        },
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
