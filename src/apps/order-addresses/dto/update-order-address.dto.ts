import { createZodDto } from 'nestjs-zod';
import { CreateOrderAddressSchema } from './create-order-address.dto';

export const UpdateOrderAddressSchema = CreateOrderAddressSchema.partial().omit({
  orderID: true, // không cho đổi orderID khi update — address luôn gắn cố định với 1 order
});

export class UpdateOrderAddressDto extends createZodDto(UpdateOrderAddressSchema) {}
