import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ExcelUtilService } from 'src/common/utils/excel-util/excel-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateUserDto, ImportUsersDto } from './dto/create-user.dto';
import { ExportUsersDto, GetUsersPaginationDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends PrismaBaseService<'user'> implements Options<User> {
  private userEntityName = User.name;
  private excelSheets = {
    [this.userEntityName]: this.userEntityName,
  };
  constructor(
    private excelUtilService: ExcelUtilService,
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
    private stringUtilServive: StringUtilService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(prismaService, 'user');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getUser(where: Prisma.UserWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async getUserProfile(userID: User['id']) {
    return this.extended.findUnique({
      where: { id: userID },
    });
  }

  async getUsers({ page, itemPerPage }: GetUsersPaginationDto) {
    const usersCacheKey = this.getUsers.name;
    const usersCached = await this.cacheManager.get(usersCacheKey);
    if (usersCached) return usersCached;

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
    await this.cacheManager.set(usersCacheKey, data);
    return data;
  }

  async createUser(createUserDto: CreateUserDto) {
    const data = await this.extended.create({
      data: createUserDto,
    });
    return data;
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: UpdateUserDto }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }

  async updateUserProfile(params: { userID: User['id']; data: UpdateUserDto }) {
    const { userID, data: dataUpdate } = params;
    return this.extended.update({
      where: { id: userID },
      data: dataUpdate,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    // const data = await this.extended.delete({
    //   where,
    // });
    const data = await this.extended.softDelete(where);
    return data;
  }

  async getOptions(params: GetOptionsParams<User>) {
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

  async exportUsers({ ids }: ExportUsersDto) {
    const users = await this.extended.export({
      where: {
        id: { in: ids },
      },
    });
    // (Tạo file excel)
    const data = this.excelUtilService.generateExcel({
      worksheets: [
        {
          sheetName: this.excelSheets[this.userEntityName],
          data: users,
        },
      ],
    });
    return data;
  }

  async importUsers({ file, user }: ImportUsersDto) {
    const userSheetName = this.excelSheets[this.userEntityName];
    const dataCreated = await this.excelUtilService.read(file);
    // Duyệt từng dòng Excel + xử lý async (hash password)
    const dataMapped = await Promise.all(
      dataCreated[userSheetName].map(async (item) => {
        if (!item.password || typeof item.password !== 'string') {
          throw new BadRequestException('Invalid password in Excel');
        }
        const cleanItem = Object.fromEntries(
          Object.entries(item).filter(([_, v]) => v !== undefined),
        );
        return {
          ...cleanItem,
          password: await this.stringUtilServive.hash(item.password),
          createdBy: user.userEmail,
        };
      }),
    );
    return await this.extended.createMany({
      data: dataMapped,
    });
  }
}
