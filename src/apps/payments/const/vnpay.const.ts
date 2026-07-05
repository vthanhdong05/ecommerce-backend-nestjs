export enum PaymentEnvs {
  VNPAY_TMN_CODE = 'VNPAY_TMN_CODE',
  VNPAY_HASH_SECRET = 'VNPAY_HASH_SECRET',
  VNPAY_URL = 'VNPAY_URL',
  VNPAY_RETURN_URL = 'VNPAY_RETURN_URL',
  VNPAY_IPN_URL = 'VNPAY_IPN_URL',
}

export const VNPAY_RESPONSE_CODE = {
  SUCCESS: '00',
} as const;

export const PAYMENT_EXPIRE_HOURS = 24;

export const VNPAY_DEFAULTS = {
  TMN_CODE: 'PDSPKL5Z',
  HASH_SECRET: 'R60QWEYVVL4K1ING7ZSJ5ZHDB4CI5Z93',
  URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  RETURN_URL: 'https://ecommerce-backend-nestjs-3yvn.onrender.com/api/payments/vnpay/return',
  IPN_URL: 'https://ecommerce-backend-nestjs-3yvn.onrender.com/api/payments/vnpay/ipn',
};

// Field names của VNPay (tránh typo)
export const VNPAY_PARAMS = {
  VERSION: 'vnp_Version',
  COMMAND: 'vnp_Command',
  TMN_CODE: 'vnp_TmnCode',
  AMOUNT: 'vnp_Amount',
  BANK_CODE: 'vnp_BankCode',
  CREATE_DATE: 'vnp_CreateDate',
  CURR_CODE: 'vnp_CurrCode',
  IP_ADDR: 'vnp_IpAddr',
  LOCALE: 'vnp_Locale',
  ORDER_INFO: 'vnp_OrderInfo',
  ORDER_TYPE: 'vnp_OrderType',
  RETURN_URL: 'vnp_ReturnUrl',
  TXN_REF: 'vnp_TxnRef',
  SECURE_HASH: 'vnp_SecureHash',
  // Response fields
  RESPONSE_CODE: 'vnp_ResponseCode',
  TRANSACTION_NO: 'vnp_TransactionNo',
  BANK_TRAN_NO: 'vnp_BankTranNo',
  CARD_TYPE: 'vnp_CardType',
  PAY_DATE: 'vnp_PayDate',
  TRANSACTION_STATUS: 'vnp_TransactionStatus',
} as const;

export const VNPAY_COMMAND = 'pay';
export const VNPAY_VERSION = '2.1.0';
export const VNPAY_CURR_CODE = 'VND';
export const VNPAY_LOCALE = 'vn';
export const VNPAY_ORDER_TYPE = 'other';

export const VNPAY_RESPONSE_CODES = {
  SUCCESS: '00',
  INVALID_SIGNATURE: '97',
  UNKNOWN_ERROR: '99',
} as const;
