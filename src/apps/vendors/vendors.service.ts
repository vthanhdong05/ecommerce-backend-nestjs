import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, VendorStatus } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateVendorDto, ImportVendorsDto } from './dto/create-vendor.dto';
import { ExportVendorsDto, GetVendorsPaginationDto } from './dto/get-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class VendorsService extends PrismaBaseService<'vendor'> implements Options<Vendor> {
  private vendorEntityName = Vendor.name;
  private excelSheets = {
    [this.vendorEntityName]: this.vendorEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private userService: UsersService,
    private queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'vendor');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getVendor(where: Prisma.VendorWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getVendorProfile(vendorID: Vendor['id']) {
    const data = await this.extended.findUnique({
      where: { id: vendorID },
    });
    return data;
  }

  // Trang public shop — chỉ trả thông tin được phép public
  async getShopInfo(vendorID: Vendor['id']) {
    const data = await this.extended.findUnique({
      where: { id: vendorID },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        totalProducts: true,
        totalOrders: true,
        status: true,
        createdAt: true,
        // Không trả: userID, taxCode, createdBy... (thông tin nội bộ)
      },
    });
    if (!data) throw new NotFoundException('Shop not found');
    if (data.status !== VendorStatus.active) {
      throw new NotFoundException('Shop is not available');
    }
    return data;
  }

  async getVendors({ page, itemPerPage }: GetVendorsPaginationDto) {
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

  async createVendor(createVendorDto: CreateVendorDto, user: UserInfo) {
    const data = await this.extended.create({
      data: {
        ...createVendorDto,
        userID: user.userID,
      } as any,
    });
    return data;
  }

  async updateVendor(params: { where: Prisma.VendorWhereUniqueInput; data: UpdateVendorDto }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  async updateVendorProfile(params: {
    vendorID: Vendor['id'];
    userID: User['id'];
    data: UpdateVendorDto;
  }) {
    const { vendorID, userID, data: dataUpdate } = params;
    // Verify user có role trong vendor này không
    const membership = await this.prismaService.userVendorRole.findUnique({
      where: { userID_vendorID: { userID, vendorID } },
    });
    if (!membership) throw new NotFoundException('Vendor not found or you do not have permission');
    return this.extended.update({
      where: { id: vendorID },
      data: dataUpdate,
    });
  }

  // lấy dữ liệu linh hoạt theo query (filter + select + limit)
  async getOptions(params: GetOptionsParams<Vendor>) {
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

  async exportVendors({ ids }: ExportVendorsDto) {
    const vendors = await this.extended.export({
      where: { id: { in: ids } },
      include: {
        user: { select: { email: true } },
      },
    });
    const mappedVendors = vendors.map(({ user, userID: _userID, ...vendor }) => ({
      ...vendor,
      userEmail: user?.email ?? null,
    }));
    return this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.vendorEntityName],
          data: mappedVendors,
        },
      ],
    });
  }

  // import danh sách vendor từ file Excel vào database
  async importVendors({ file }: ImportVendorsDto) {
    const vendorSheetName = this.excelSheets[this.vendorEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const allUsers = await this.userService.client.findMany({
      select: { id: true, email: true },
    });
    const emailToId = new Map<string, string>(allUsers.map((u) => [u.email, u.id]));
    // validate trước, không throw trong .map()
    const rows = dataCreated[vendorSheetName];
    for (const item of rows) {
      if (!emailToId.has(item.userEmail)) {
        throw new BadRequestException(`User not found with email: "${item.userEmail}"`);
      }
    }
    const data = await this.extended.createMany({
      data: rows.map((item) => {
        const { userEmail, ...itemRemain } = item;
        return { ...itemRemain, userID: emailToId.get(userEmail)! };
        // bỏ `user` — không phải Prisma field
      }),
    });
    return data;
  }

  async deleteVendor(where: Prisma.VendorWhereUniqueInput) {
    const data = await this.extended.softDelete(where);
    return data;
  }

  async getVendorStatistics(vendorID: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const [revenueThisMonth, revenueThisQuarter, revenueThisYear, topProducts, ordersToPackToday] =
      await Promise.all([
        // 1. Doanh thu theo tháng/quý/năm — tính từ OrderItem của vendor
        this.prismaService.orderItem.aggregate({
          where: {
            vendorID,
            order: {
              status: { notIn: [OrderStatus.cancelled, OrderStatus.refunded] },
              createdAt: { gte: startOfMonth },
            },
          },
          _sum: { totalPrice: true },
        }),
        this.prismaService.orderItem.aggregate({
          where: {
            vendorID,
            order: {
              status: { notIn: [OrderStatus.cancelled, OrderStatus.refunded] },
              createdAt: { gte: startOfQuarter },
            },
          },
          _sum: { totalPrice: true },
        }),
        this.prismaService.orderItem.aggregate({
          where: {
            vendorID,
            order: {
              status: { notIn: [OrderStatus.cancelled, OrderStatus.refunded] },
              createdAt: { gte: startOfYear },
            },
          },
          _sum: { totalPrice: true },
        }),
        // 2. Sản phẩm bán chạy — group theo productVariantID, sum quantity
        this.prismaService.orderItem.groupBy({
          by: ['productVariantID'],
          where: {
            vendorID,
            order: { status: { notIn: [OrderStatus.cancelled, OrderStatus.refunded] } },
          },
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),
        // 3. Đơn cần đóng gói hôm nay — status: confirmed
        this.prismaService.order.findMany({
          where: {
            orderItems: { some: { vendorID } },
            status: OrderStatus.confirmed,
          },
          include: {
            orderItems: { where: { vendorID } },
            orderAddresses: { where: { type: 'shipping' } },
          },
        }),
      ]);
    // Lấy thông tin variant cho top products
    const variantIDs = topProducts.map((p) => p.productVariantID);
    const variants = await this.prismaService.productVariant.findMany({
      where: { id: { in: variantIDs } },
      select: {
        id: true,
        name: true,
        sku: true,
        product: { select: { id: true, name: true } },
      },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    return {
      revenue: {
        thisMonth: Number(revenueThisMonth._sum.totalPrice ?? 0),
        thisQuarter: Number(revenueThisQuarter._sum.totalPrice ?? 0),
        thisYear: Number(revenueThisYear._sum.totalPrice ?? 0),
      },
      topProducts: topProducts.map((item) => {
        const variant = variantMap.get(item.productVariantID);
        return {
          productVariantID: item.productVariantID,
          productName: variant?.product.name ?? 'Unknown',
          variantName: variant?.name ?? null,
          sku: variant?.sku ?? null,
          totalQuantitySold: item._sum.quantity ?? 0,
          totalRevenue: Number(item._sum.totalPrice ?? 0),
        };
      }),
      ordersToPackToday: ordersToPackToday.map((order) => ({
        orderID: order.id,
        orderNumber: order.orderNumber,
        shippingAddress: order.orderAddresses[0] ?? null,
        items: order.orderItems.map((item) => ({
          productVariantID: item.productVariantID,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          snapshot: item.productVariantSnapshot,
        })),
      })),
    };
  }

  @OnEvent('product.created')
  async onProductCreated({ vendorID }: { vendorID: Vendor['id'] }) {
    await this.extended.update({
      where: { id: vendorID },
      data: { totalProducts: { increment: 1 } },
    });
  }

  @OnEvent('product.deleted')
  async onProductDeleted({ vendorID }: { vendorID: Vendor['id'] }) {
    await this.extended.update({
      where: { id: vendorID },
      data: { totalProducts: { decrement: 1 } },
    });
  }

  @OnEvent('product.imported')
  async onProductImported({ vendorID, count }: { vendorID: Vendor['id']; count: number }) {
    await this.extended.update({
      where: { id: vendorID },
      data: { totalProducts: { increment: count } },
    });
  }

  @OnEvent('order.created')
  async onOrderCreated({ vendorIDs }: { orderID: string; userID: string; vendorIDs: string[] }) {
    await this.extended.updateMany({
      where: { id: { in: vendorIDs } },
      data: { totalOrders: { increment: 1 } },
    });
  }
}
