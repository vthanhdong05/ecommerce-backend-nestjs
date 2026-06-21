import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { OrderAddress } from '@prisma/client';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';
import { OrderAddressesService } from './order-addresses.service';

@Controller('orderAddresses')
export class OrderAddressesController {
  constructor(private readonly orderAddressesService: OrderAddressesService) {}

  @Patch(':id')
  updateOrderAddress(
    @Param('id') id: OrderAddress['id'],
    @Body() updateOrderAddressDto: UpdateOrderAddressDto,
  ) {
    return this.orderAddressesService.updateOrderAddress({
      data: updateOrderAddressDto,
      where: { id },
    });
  }

  @Get(':id')
  getOrderAddress(@Param('id') id: OrderAddress['id']) {
    return this.orderAddressesService.getOrderAddress({ id });
  }
}
