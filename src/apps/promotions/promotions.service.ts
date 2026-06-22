import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PromotionScope, PromotionStatus, PromotionType } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ExportPromotionsDto, GetPromotionsPaginationDto } from './dto/get-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion } from './entities/promotion.entity';

@Injectable()
export class PromotionsService
  extends PrismaBaseService<'promotion'>
  implements Options<Promotion>
{
  private promotionEntityName = Promotion.name;
  private excelSheets = {
    [this.promotionEntityName]: this.promotionEntityName,
  };

  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'promotion');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getPromotion(where: Prisma.PromotionWhereUniqueInput) {
    const data = await this.extended.findUnique({ where });
    if (!data) throw new NotFoundException('Promotion not found');
    return data;
  }

  async getPromotions({
    page,
    itemPerPage,
    status,
  }: GetPromotionsPaginationDto & { status?: PromotionStatus }) {
    const where = { ...(status && { status }) };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({ page, itemPerPage, totalItems });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
    });
    return paging.format(list);
  }

  async createPromotion(createPromotionDto: CreatePromotionDto, user: UserInfo) {
    return this.extended.create({
      data: {
        ...createPromotionDto,
        user,
      } as any,
    });
  }

  async updatePromotion(params: {
    where: Prisma.PromotionWhereUniqueInput;
    data: UpdatePromotionDto;
  }) {
    const { where, data: dataUpdate } = params;
    const promotion = await this.extended.findUnique({ where });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return this.extended.update({ data: dataUpdate, where });
  }

  // (Dùng để deactivate thay vì xóa thật — khi đã có OrderPromotion tham chiếu)
  async deactivatePromotion(where: Prisma.PromotionWhereUniqueInput) {
    const promotion = await this.extended.findUnique({ where });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return this.extended.update({
      where,
      data: { status: PromotionStatus.inactive },
    });
  }

  // (Xóa thật — chỉ cho phép khi chưa có OrderPromotion nào dùng tới)
  async deletePromotion(where: Prisma.PromotionWhereUniqueInput) {
    const promotion = await this.extended.findUnique({
      where,
      include: { orderPromotions: true },
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    if (promotion.orderPromotions.length > 0) {
      throw new BadRequestException(
        'Cannot delete a promotion that has been used in orders. Deactivate it instead.',
      );
    }
    return this.extended.softDelete(where);
  }

  // (Gọi nội bộ từ OrdersService.createOrder — validate code + tính discountAmount)
  async validateAndCalculateDiscount(
    code: string,
    subtotal: number,
    tx: Prisma.TransactionClient,
  ): Promise<{ promotionID: string; discountAmount: number; scope: PromotionScope }> {
    const promotion = await tx.promotion.findUnique({ where: { code } });

    if (!promotion) throw new BadRequestException(`Promotion code "${code}" is not valid`);
    if (promotion.status !== PromotionStatus.active) {
      throw new BadRequestException(`Promotion code "${code}" is not active`);
    }
    const now = new Date();
    if (promotion.startDate > now) {
      throw new BadRequestException(`Promotion code "${code}" has not started yet`);
    }
    if (promotion.endDate && promotion.endDate < now) {
      throw new BadRequestException(`Promotion code "${code}" has expired`);
    }
    if (promotion.usageLimit !== null) {
      const usageCount = await tx.orderPromotion.count({ where: { promotionID: promotion.id } });
      if (usageCount >= promotion.usageLimit) {
        throw new BadRequestException(`Promotion code "${code}" has reached its usage limit`);
      }
    }
    const value = Number(promotion.value);
    let discountAmount = 0;
    switch (promotion.type) {
      case PromotionType.percentage:
        discountAmount = (subtotal * value) / 100;
        break;
      case PromotionType.fixed_amount:
        // không giảm nhiều hơn subtotal (tránh số âm)
        discountAmount = Math.min(value, subtotal);
        break;
      case PromotionType.buy_x_get_y:
        // TODO: buy_x_get_y cần thêm logic riêng khi biết rõ cách tính (vd: mua 2 tặng 1)
        // Tạm thời xử lý như fixed_amount, note backlog
        discountAmount = Math.min(value, subtotal);
        break;
    }
    return { promotionID: promotion.id, discountAmount, scope: promotion.scope };
  }

  async getOptions(params: GetOptionsParams<Promotion>) {
    const { limit, select, ...searchFields } = params;
    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);
    return this.extended.findMany({
      select: fieldsSelect,
      where: { ...searchFields },
      take: Number(limit),
    });
  }

  async exportPromotions({ ids }: ExportPromotionsDto) {
    const promotions = await this.extended.export({
      where: { id: { in: ids } },
    });
    return this.excelUtilService.generateExcel({
      worksheets: [{ sheetName: this.excelSheets[this.promotionEntityName], data: promotions }],
    });
  }
}
