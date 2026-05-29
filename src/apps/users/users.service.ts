import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetOptionsParams, Options } from '../../common/query/options.interface';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { QueryUtilService } from '../../common/utils/query-util/query-util.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersPaginationDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends PrismaBaseService<'user'> implements Options<User> {
  constructor(
    public prismaService: PrismaService,
    private paginationUtilService: PaginationUtilService,
    private queryUtil: QueryUtilService,
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
}
