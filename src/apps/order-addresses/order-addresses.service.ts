import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PrismaBaseService } from '../../common/services/prisma-base.service';
import { CreateOrderAddressDto } from './dto/create-order-address.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';

export class OrderAddressesService extends PrismaBaseService<'orderAddress'> {
  constructor(public prismaService: PrismaService) {
    super(prismaService, 'orderAddress');
  }

  get client() {
    return super.client;
  }

  get extended() {
    return super.extended;
  }

  async getOrderAddress(where: Prisma.OrderAddressWhereUniqueInput) {
    const data = await this.extended.findUnique({
      where,
    });
    return data;
  }

  async createOrderAddress(createOrderAddressDto: CreateOrderAddressDto) {
    const data = await this.extended.create({
      data: createOrderAddressDto,
    });
    return data;
  }

  async updateOrderAddress(params: {
    where: Prisma.OrderAddressWhereUniqueInput;
    data: UpdateOrderAddressDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }
}
