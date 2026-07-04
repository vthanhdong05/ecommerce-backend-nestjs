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
