import { Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { CartItemsService } from './cart-items.service';
import { CartsService } from '../carts/carts.service';

@Module({
  imports: [],
  controllers: [CartItemsController],
  providers: [CartItemsService, CartsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
