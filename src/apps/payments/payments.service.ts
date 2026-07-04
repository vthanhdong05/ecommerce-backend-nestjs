import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { PAYMENT_EXPIRE_HOURS, PaymentEnvs, VNPAY_DEFAULTS } from './const/vnpay.const';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsPaginationDto } from './dto/get-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService extends PrismaBaseService<'payment'> {
  constructor(
    public prismaService: PrismaService,
    private configService: ConfigService,
    private paginationUtil: PaginationUtilService,
  ) {
    super(prismaService, 'payment');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (Tạo payment cho order — COD: succeeded luôn, VNPay: pending +24h)
  async createPayment(dto: CreatePaymentDto, user: UserInfo) {
    const order = await this.prismaService.order.findFirst({
      where: { id: dto.orderID, userID: user.userID },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending' && order.status !== 'pending_payment') {
      throw new BadRequestException(`Order with status "${order.status}" is not payable`);
    }
    // Check đã có active payment chưa
    const existingPayment = await this.extended.findFirst({
      where: {
        orderID: order.id,
        status: { in: [PaymentStatus.succeeded, PaymentStatus.pending] },
      },
    });
    if (existingPayment) {
      throw new BadRequestException('Order already has an active payment');
    }
    // Tính expiredAt = 24h sau
    const expiredAt = new Date(Date.now() + PAYMENT_EXPIRE_HOURS * 60 * 60 * 1000);
    // COD - tạo succeeded + update order confirmed
    if (dto.method === PaymentMethod.cod) {
      return this.prismaService.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderID: order.id,
            method: PaymentMethod.cod,
            status: PaymentStatus.succeeded,
            amount: order.totalAmount,
            expiredAt,
            createdBy: user.userEmail,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'confirmed' },
        });
        return payment;
      });
    }
    // VNPay - tạo pending + update order pending_payment
    return this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderID: order.id,
          method: PaymentMethod.vnpay,
          status: PaymentStatus.pending,
          amount: order.totalAmount,
          expiredAt,
          createdBy: user.userEmail,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'pending_payment',
          paymentMethod: PaymentMethod.vnpay,
          expiredAt,
        },
      });
      return payment;
    });
  }

  async getPayments(params: GetPaymentsPaginationDto & { userID: string }) {
    const { page, itemPerPage, userID, status } = params;
    const where: Prisma.PaymentWhereInput = {
      order: { userID },
      ...(status && { status }),
    };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtil.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      include: { order: { select: { id: true, orderNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return paging.format(list);
  }

  async getPayment(id: string, userID: string) {
    const payment = await this.extended.findFirst({
      where: { id, order: { userID } },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // (Update payment fields — dùng cho IPN return từ VNPay)
  async updatePayment(id: string, dto: UpdatePaymentDto) {
    return await this.extended.update({
      where: { id },
      data: dto,
    });
  }

  // (Đánh dấu succeeded + update order status = confirmed)
  async markAsSucceeded(id: string) {
    return this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.succeeded },
      });
      await tx.order.update({
        where: { id: payment.orderID },
        data: { status: 'confirmed' },
      });
      return payment;
    });
  }

  // (Đánh dấu failed + lưu response code)
  async markAsFailed(id: string, responseCode: string) {
    return await this.extended.update({
      where: { id },
      data: {
        status: PaymentStatus.failed,
        vnpResponseCode: responseCode,
      },
    });
  }

  // (Cron job: cancel tất cả payment quá hạn 24h + update order cancelled)
  async cancelExpiredPayments() {
    return this.prismaService.$transaction(async (tx) => {
      const expiredPayments = await tx.payment.findMany({
        where: {
          status: PaymentStatus.pending,
          expiredAt: { lt: new Date() },
        },
      });
      for (const payment of expiredPayments) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.cancelled },
        });
        await tx.order.update({
          where: { id: payment.orderID },
          data: { status: 'cancelled' },
        });
      }
      return expiredPayments.length;
    });
  }

  // (Hoàn tiền VNPay — chỉ áp dụng cho payment succeeded + method vnpay)
  async refundPayment(id: string, reason: string) {
    const payment = await this.extended.findFirst({
      where: { id, status: PaymentStatus.succeeded },
    });
    if (!payment) throw new NotFoundException('Succeeded payment not found');
    if (payment.method !== PaymentMethod.vnpay) {
      throw new BadRequestException('Only VNPay payments can be refunded');
    }
    // TODO: Gọi API refund của VNPay
    // Tạm thời update thẳng vào DB
    return this.extended.update({
      where: { id },
      data: {
        status: PaymentStatus.refunded,
        refundAmount: payment.amount,
        refundDate: new Date(),
        refundReason: reason,
        refundTxnRef: `REFUND-${Date.now()}`,
      },
    });
  }

  // (Lấy config VNPay từ env, fallback sang default nếu env chưa có)
  getVNPayConfig() {
    return {
      tmnCode: this.configService.get(PaymentEnvs.VNPAY_TMN_CODE) ?? VNPAY_DEFAULTS.TMN_CODE,
      hashSecret:
        this.configService.get(PaymentEnvs.VNPAY_HASH_SECRET) ?? VNPAY_DEFAULTS.HASH_SECRET,
      url: this.configService.get(PaymentEnvs.VNPAY_URL) ?? VNPAY_DEFAULTS.URL,
      returnUrl: this.configService.get(PaymentEnvs.VNPAY_RETURN_URL) ?? VNPAY_DEFAULTS.RETURN_URL,
      ipnUrl: this.configService.get(PaymentEnvs.VNPAY_IPN_URL) ?? VNPAY_DEFAULTS.IPN_URL,
    };
  }

  // (Lấy payment theo vnpTxnRef — dùng cho IPN handler)
  async getPaymentByTxnRef(txnRef: string) {
    return await this.extended.findUnique({ where: { vnpTxnRef: txnRef } });
  }
}
