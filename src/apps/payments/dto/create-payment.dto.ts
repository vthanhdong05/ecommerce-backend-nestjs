import { PaymentMethod } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  orderID: z.string().uuid({ message: 'Invalid order id' }),
  method: z.nativeEnum(PaymentMethod, {
    message: 'Method must be either "cod" or "vnpay"',
  }),
});

export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
