import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { OrderAddress } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';
import { OrderAddressesService } from './order-addresses.service';

@Controller('orderAddresses')
export class OrderAddressesController {
  constructor(private readonly orderAddressesService: OrderAddressesService) {}

  @Get('recent')
  @SkipPermission()
  getRecentAddresses(@User() user: UserInfo) {
    return this.orderAddressesService.getRecentAddresses(user.userID);
  }

  @Get(':id')
  @SkipPermission()
  getOrderAddress(@Param('id') id: OrderAddress['id'], @User() user: UserInfo) {
    return this.orderAddressesService.getOrderAddress({ id, userID: user.userID });
  }

  @Patch(':id')
  @SkipPermission()
  updateOrderAddress(
    @Param('id') id: OrderAddress['id'],
    @Body() updateOrderAddressDto: UpdateOrderAddressDto,
    @User() user: UserInfo,
  ) {
    return this.orderAddressesService.updateOrderAddress({
      data: updateOrderAddressDto,
      where: { id },
      userID: user.userID,
    });
  }
}
