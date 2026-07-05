import { PaymentStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetPaymentsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  itemPerPage: z.coerce.number().int().min(1).default(10),
  status: z.nativeEnum(PaymentStatus).optional(),
  orderID: z.string().uuid().optional(),
});

export class GetPaymentsPaginationDto extends createZodDto(GetPaymentsPaginationSchema) {}
