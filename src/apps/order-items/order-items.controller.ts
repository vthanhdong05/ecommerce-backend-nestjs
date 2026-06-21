import { Controller, Get, Param } from '@nestjs/common';
import { OrderItem } from '@prisma/client';
import { OrderItemsService } from './order-items.service';

@Controller('orderItems')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get(':id')
  getOrderItem(@Param('id') id: OrderItem['id']) {
    return this.orderItemsService.getOrderItem({ id });
  }
}
