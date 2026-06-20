import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { Order } from '../entities/order.entity';

export class UpdateOrderDto extends IntersectionType(
  PartialType(CreateOrderDto),
  PickType(Order, ['id']),
) {}
