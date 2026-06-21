import { Module } from '@nestjs/common';
import { OrderAddressesController } from './order-addresses.controller';
import { OrderAddressesService } from './order-addresses.service';

@Module({
  controllers: [OrderAddressesController],
  providers: [OrderAddressesService],
  exports: [OrderAddressesService],
})
export class OrderAddressesModule {}
