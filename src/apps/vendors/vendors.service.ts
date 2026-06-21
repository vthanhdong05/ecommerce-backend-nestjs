import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { ExcelUtilService } from '../../common/utils/excel-util/excel-util.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { UsersService } from '../users/users.service';
import { CreateVendorDto, ImportVendorsDto } from './dto/create-vendor.dto';
import { ExportVendorsDto, GetVendorsPaginationDto } from './dto/get-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';

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
    private eventEmitter: EventEmitter2,
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

  async updateVendorProfile(params: { vendorID: Vendor['id']; data: UpdateVendorDto }) {
    const { vendorID, data: dataUpdate } = params;
    const data = await this.extended.update({
      where: { id: vendorID },
      data: dataUpdate,
    });
    return data;
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
  async importVendors({ file, user }: ImportVendorsDto) {
    const vendorSheetName = this.excelSheets[this.vendorEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    const allUsers = await this.userService.client.findMany({
      select: { id: true, email: true },
    });
    const emailToId = new Map<string, string>(allUsers.map((u) => [u.email, u.id]));
    const data = await this.extended.createMany({
      data: dataCreated[vendorSheetName].map((item) => {
        const { userEmail, ...itemRemain } = item;
        const userID = emailToId.get(userEmail);
        if (!userID) {
          throw new BadRequestException(`User not found with email: "${userEmail}"`);
        }
        return { ...itemRemain, userID, user };
      }),
    });
    return data;
  }

  async deleteVendor(where: Prisma.VendorWhereUniqueInput) {
    const data = await this.extended.softDelete(where);
    return data;
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
