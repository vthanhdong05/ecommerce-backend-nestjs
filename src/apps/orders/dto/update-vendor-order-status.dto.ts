import { OrderStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateVendorOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export class UpdateVendorOrderStatusDto extends createZodDto(UpdateVendorOrderStatusSchema) {}
