import { PaymentStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  vnpTransactionNo: z.string().trim().optional().nullable(),
  vnpBankCode: z.string().trim().optional().nullable(),
  vnpBankTranNo: z.string().trim().optional().nullable(),
  vnpCardType: z.string().trim().optional().nullable(),
  vnpPayDate: z.coerce.date().optional().nullable(),
  vnpResponseCode: z.string().trim().optional().nullable(),
});

export class UpdatePaymentDto extends createZodDto(UpdatePaymentSchema) {}
