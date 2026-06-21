import { AddressType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateOrderAddressSchema = z.object({
  // orderID bắt buộc — nhưng do OrdersService tự truyền khi gọi nội bộ (trong transaction), không phải client gửi qua API public
  orderID: z.string().uuid({ message: 'Invalid order id' }),
  type: z.nativeEnum(AddressType),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  fullAddress: z.string().trim().min(1),
  city: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  phone: z.string().trim().min(1),
});

export class CreateOrderAddressDto extends createZodDto(CreateOrderAddressSchema) {}
