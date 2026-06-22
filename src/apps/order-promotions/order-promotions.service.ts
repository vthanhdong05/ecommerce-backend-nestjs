import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { CreateOrderPromotionDto } from './dto/create-order-promotion.dto';
import { ExportOrderPromotionsDto } from './dto/get-order-promotion.dto';

@Injectable()
export class OrderPromotionsService extends PrismaBaseService<'orderPromotion'> {
  constructor(
    public prismaService: PrismaService,
    private excelUtilService: ExcelUtilService,
  ) {
    super(prismaService, 'orderPromotion');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  // (Gọi nội bộ từ OrdersService.createOrder — trong transaction)
  async createOrderPromotion(data: CreateOrderPromotionDto, tx: Prisma.TransactionClient) {
    return tx.orderPromotion.create({ data });
  }

  // (Admin tra cứu — filter theo orderID hoặc promotionID)
  async getOrderPromotions({ orderID, promotionID }: { orderID?: string; promotionID?: string }) {
    const where: Prisma.OrderPromotionWhereInput = {
      ...(orderID && { orderID }),
      ...(promotionID && { promotionID }),
    };
    return this.extended.findMany({
      where,
      include: {
        promotion: { select: { id: true, name: true, code: true, type: true, scope: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    });
  }

  async exportOrderPromotions({ orderIDs, promotionIDs }: ExportOrderPromotionsDto) {
    const where: Prisma.OrderPromotionWhereInput = {
      ...(orderIDs && { orderID: { in: orderIDs } }),
      ...(promotionIDs && { promotionID: { in: promotionIDs } }),
    };

    const orderPromotions = await this.extended.findMany({
      where,
      include: {
        promotion: { select: { name: true, code: true } },
        order: { select: { orderNumber: true } },
      },
    });

    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: 'OrderPromotions',
          data: orderPromotions.map((op) => ({
            orderNumber: op.order.orderNumber,
            promotionName: op.promotion.name,
            promotionCode: op.promotion.code,
            discountAmount: op.discountAmount,
          })),
        },
      ],
    });
  }
}
