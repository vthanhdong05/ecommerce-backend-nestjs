import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateOrderDto, ImportOrdersDto } from './dto/create-order.dto';
import { ExportOrdersDto, GetOrdersPaginationDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService extends PrismaBaseService<'order'> implements Options<Order> {
  private orderEntityName = Order.name;
  private excelSheets = {
    [this.orderEntityName]: this.orderEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'order');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getOrder(where: Prisma.OrderWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  // (Lấy 1 order của vendor)
  async getVendorOrder({ id, vendorID }: { id: string; vendorID: string }) {
    return this.extended.findFirst({
      where: {
        id,
        orderItems: { some: { vendorID } },
      },
      include: {
        orderItems: {
          where: { vendorID }, // (chỉ lấy items của vendor)
        },
      },
    });
  }

  async getOrders({ page, itemPerPage }: GetOrdersPaginationDto) {
    const totalItems = await this.extended.count();
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      skip: paging.skip,
      take: itemPerPage,
    });
    const data = paging.format(list);
    return data;
  }

  // (Lấy orders của vendor có phân trang)
  async getVendorOrders({
    vendorID,
    page,
    itemPerPage,
  }: GetOrdersPaginationDto & { vendorID: string }) {
    const where: Prisma.OrderWhereInput = {
      orderItems: { some: { vendorID } }, // (filter order có item của vendor)
    };
    const totalItems = await this.extended.count({ where });
    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });
    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      include: {
        orderItems: {
          where: { vendorID }, // (chỉ lấy items của vendor đó)
        },
      },
    });
    return paging.format(list);
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const data = await this.extended.create({
      data: createOrderDto,
    });
    return data;
  }

  async updateOrder(params: { where: Prisma.OrderWhereUniqueInput; data: UpdateOrderDto }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  // (Vendor update status order)
  async updateVendorOrder({
    id,
    vendorID,
    data,
  }: {
    id: string;
    vendorID: string;
    data: UpdateOrderDto;
  }) {
    // (Verify order có chứa item của vendor không)
    const order = await this.extended.findFirst({
      where: {
        id,
        orderItems: { some: { vendorID } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.extended.update({
      where: { id },
      data,
    });
  }

  async getOptions(params: GetOptionsParams<Order>) {
    const { limit, select, ...searchFields } = params;
    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);
    const data = await this.extended.findMany({
      select: fieldsSelect,
      where: {
        ...searchFields,
      },
      take: Number(limit),
    });
    return data;
  }

  async exportOrders({ ids }: ExportOrdersDto) {
    const orders = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.orderEntityName],
          data: orders,
        },
      ],
    });

    return data;
  }

  async importOrders({ file, user }: ImportOrdersDto) {
    const orderSheetName = this.excelSheets[this.orderEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const data = await this.extended.createMany({
      data: dataCreated[orderSheetName].map((item) => ({
        ...item,
        user,
      })),
    });
    return data;
  }

  async deleteOrder(where: Prisma.OrderWhereUniqueInput) {
    const data = await this.extended.softDelete(where);
    return data;
  }
}
