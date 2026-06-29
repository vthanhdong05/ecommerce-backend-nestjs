import { Controller, Get, Param } from '@nestjs/common';
import { OrderItem } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { OrderItemsService } from './order-items.service';

@Controller('orderItems')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get(':id')
  @SkipPermission()
  getOrderItem(@Param('id') id: OrderItem['id'], @User() user: UserInfo) {
    return this.orderItemsService.getOrderItem({ id, userID: user.userID });
  }
}
