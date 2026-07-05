import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
import * as crypto from 'crypto';
import {
  PaymentEnvs,
  VNPAY_COMMAND,
  VNPAY_CURR_CODE,
  VNPAY_DEFAULTS,
  VNPAY_LOCALE,
  VNPAY_ORDER_TYPE,
  VNPAY_PARAMS,
  VNPAY_RESPONSE_CODES,
  VNPAY_VERSION,
} from '../const/vnpay.const';
import { PaymentsService } from '../payments.service';
import {
  buildQueryString,
  createVNPaySignature,
  formatVNPayAmount,
  formatVNPayDate,
  sortObject,
  verifyVNPaySignature,
} from '../utils/vnpay.util';

@Injectable()
export class VNPayService {
  constructor(
    private configService: ConfigService,
    private paymentsService: PaymentsService,
  ) {}

  private getConfig() {
    return {
      tmnCode: this.configService.get(PaymentEnvs.VNPAY_TMN_CODE) ?? VNPAY_DEFAULTS.TMN_CODE,
      hashSecret:
        this.configService.get(PaymentEnvs.VNPAY_HASH_SECRET) ?? VNPAY_DEFAULTS.HASH_SECRET,
      url: this.configService.get(PaymentEnvs.VNPAY_URL) ?? VNPAY_DEFAULTS.URL,
      returnUrl: this.configService.get(PaymentEnvs.VNPAY_RETURN_URL) ?? VNPAY_DEFAULTS.RETURN_URL,
      ipnUrl: this.configService.get(PaymentEnvs.VNPAY_IPN_URL) ?? VNPAY_DEFAULTS.IPN_URL,
    };
  }

  // Tạo URL thanh toán VNPay
  async createPaymentUrl(paymentID: string, ipAddr: string): Promise<string> {
    const payment = await this.paymentsService.extended.findUnique({
      where: { id: paymentID },
      include: { order: true },
    });
    if (!payment) throw new Error('Payment not found');
    if (payment.method !== PaymentMethod.vnpay) {
      throw new Error('Payment is not VNPay');
    }

    const config = this.getConfig();
    const createDate = formatVNPayDate();
    const txnRef = `${payment.id}-${Date.now()}`;

    const params: Record<string, string> = {
      vnp_Version: VNPAY_VERSION,
      vnp_Command: VNPAY_COMMAND,
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: formatVNPayAmount(Number(payment.amount)),
      vnp_BankCode: '',
      vnp_CreateDate: createDate,
      vnp_CurrCode: VNPAY_CURR_CODE,
      vnp_IpAddr: ipAddr,
      vnp_Locale: VNPAY_LOCALE,
      vnp_OrderInfo: `Thanh toan don hang ${payment.order.orderNumber}`,
      vnp_OrderType: VNPAY_ORDER_TYPE,
      vnp_ReturnUrl: config.returnUrl,
      vnp_TxnRef: txnRef,
    };

    // Tạo chữ ký
    const secureHash = createVNPaySignature(params, config.hashSecret);
    params.vnp_SecureHash = secureHash;

    // Lưu txnRef vào payment
    await this.paymentsService.updatePayment(paymentID, {
      // Note: cần thêm field vnpTxnRef vào payment (chưa có trong UpdateDto)
      // Tạm thời skip - sẽ xử lý riêng
    });

    // Build URL
    return `${config.url}?${buildQueryString(params)}`;
  }

  // Verify signature từ VNPay callback
  verifyCallback(params: Record<string, string>): boolean {
    const config = this.getConfig();
    const receivedHash = params[VNPAY_PARAMS.SECURE_HASH];
    if (!receivedHash) return false;
    return verifyVNPaySignature(params, config.hashSecret, receivedHash);
  }

  // Xử lý callback từ VNPay
  async handleCallback(params: Record<string, string>) {
    const config = this.getConfig();

    // Verify signature
    const paramsWithoutHash = { ...params };
    const receivedHash = paramsWithoutHash.vnp_SecureHash;
    delete paramsWithoutHash.vnp_SecureHash;
    delete paramsWithoutHash.vnp_SecureHashType;

    const sortedParams = sortObject(paramsWithoutHash);
    const signData = buildQueryString(sortedParams);
    const expectedHash = crypto
      .createHmac('sha512', config.hashSecret)
      .update(signData, 'utf-8')
      .digest('hex');

    if (receivedHash !== expectedHash) {
      throw new Error('Invalid signature');
    }

    const txnRef = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const amount = Number(params.vnp_Amount) / 100;

    // Tìm payment bằng txnRef (txnRef = `${payment.id}-${timestamp}`)
    const paymentID = txnRef?.split('-')[0];
    if (!paymentID) throw new Error('Invalid txnRef');

    const payment = await this.paymentsService.extended.findUnique({
      where: { id: paymentID },
    });
    if (!payment) throw new Error('Payment not found');

    if (responseCode === VNPAY_RESPONSE_CODES.SUCCESS) {
      // Thành công
      await this.paymentsService.markAsSucceeded(paymentID);
      await this.paymentsService.updatePayment(paymentID, {
        vnpTransactionNo: params.vnp_TransactionNo,
        vnpBankCode: params.vnp_BankCode,
        vnpBankTranNo: params.vnp_BankTranNo,
        vnpCardType: params.vnp_CardType,
        vnpPayDate: new Date(this.parseVNPayDate(params.vnp_PayDate)).toISOString(),
        vnpResponseCode: responseCode,
      });
    } else {
      // Thất bại
      await this.paymentsService.markAsFailed(paymentID, responseCode);
    }

    return { paymentID, responseCode, amount };
  }

  private parseVNPayDate(dateStr: string): string {
    // Parse "yyyyMMddHHmmss" to Date
    const y = +dateStr.substring(0, 4);
    const m = +dateStr.substring(4, 6) - 1;
    const d = +dateStr.substring(6, 8);
    const h = +dateStr.substring(8, 10);
    const min = +dateStr.substring(10, 12);
    const s = +dateStr.substring(12, 14);
    return new Date(y, m, d, h, min, s).toISOString();
  }
}
