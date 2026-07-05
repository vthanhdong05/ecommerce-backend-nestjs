import { $Enums, Payment as PaymenPrisna } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Payment implements PaymenPrisna {
  id!: string;
  orderID!: string;
  method!: $Enums.PaymentMethod;
  status!: $Enums.PaymentStatus;
  amount!: Decimal;
  vnpTxnRef!: string | null;
  vnpTransactionNo!: string | null;
  vnpBankCode!: string | null;
  vnpBankTranNo!: string | null;
  vnpCardType!: string | null;
  vnpPayDate!: Date | null;
  vnpResponseCode!: string | null;
  refundAmount!: Decimal | null;
  refundDate!: Date | null;
  refundReason!: string | null;
  refundTxnRef!: string | null;
  refundResponseCode!: string | null;
  expiredAt!: Date | null;
  createdAt!: Date;
  createdBy!: string | null;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
