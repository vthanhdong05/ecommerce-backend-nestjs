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

  async createOrderAddress(
    createOrderAddressDto: CreateOrderAddressDto,
    tx: Prisma.TransactionClient,
  ) {
    const data = await tx.orderAddress.create({
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

  // Lấy danh sách địa chỉ giao hàng gần đây của user — dùng để gợi ý khi đặt hàng mới
  async getRecentAddresses(userID: string) {
    const addresses = await this.extended.findMany({
      where: {
        type: 'shipping', // chỉ lấy địa chỉ giao hàng, không lấy billing
        order: { userID }, // chỉ lấy của user hiện tại
      },
      select: {
        firstName: true,
        lastName: true,
        company: true,
        fullAddress: true,
        city: true,
        province: true,
        country: true,
        phone: true,
      },
      take: 5, // tối đa 5 địa chỉ gần nhất (đã được sort desc bởi $extends hook mặc định)
    });
    // Loại bỏ địa chỉ trùng lặp theo fullAddress + phone
    const seen = new Set<string>();
    return addresses.filter(({ fullAddress, phone }) => {
      const key = `${fullAddress}_${phone}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
