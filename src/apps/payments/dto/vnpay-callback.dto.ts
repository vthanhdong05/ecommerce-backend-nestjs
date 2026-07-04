import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema cho IPN/Return từ VNPay
export const VNPayCallbackSchema = z.object({
  vnp_Amount: z.string(),
  vnp_BankCode: z.string(),
  vnp_BankTranNo: z.string().optional(),
  vnp_CardType: z.string().optional(),
  vnp_OrderInfo: z.string(),
  vnp_PayDate: z.string(),
  vnp_ResponseCode: z.string(),
  vnp_TmnCode: z.string(),
  vnp_TransactionNo: z.string().optional(),
  vnp_TransactionStatus: z.string().optional(),
  vnp_TxnRef: z.string(),
  vnp_SecureHash: z.string(),
  vnp_SecureHashType: z.string().optional(),
});

export class VNPayCallbackDto extends createZodDto(VNPayCallbackSchema) {}
