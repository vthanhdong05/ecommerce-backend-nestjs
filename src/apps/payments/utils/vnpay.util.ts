import * as crypto from 'crypto';

// Sắp xếp params theo alphabet (yêu cầu của VNPay)
export function sortObject(obj: Record<string, string | undefined>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined && obj[k] !== '');
  keys.sort();
  for (const key of keys) {
    sorted[key] = obj[key] as string;
  }
  return sorted;
}

// Build query string từ object đã sort
export function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

// Tạo chữ ký SHA512 cho VNPay
export function createVNPaySignature(
  params: Record<string, string | undefined>,
  hashSecret: string,
): string {
  const sorted = sortObject(params);
  const signData = buildQueryString(sorted);
  const hmac = crypto.createHmac('sha512', hashSecret);
  return hmac.update(signData, 'utf-8').digest('hex');
}

// Verify chữ ký từ VNPay callback
export function verifyVNPaySignature(
  params: Record<string, string>,
  hashSecret: string,
  receivedSignature: string,
): boolean {
  const paramsWithoutSignature = { ...params };
  delete paramsWithoutSignature.vnp_SecureHash;
  const expectedSignature = createVNPaySignature(paramsWithoutSignature, hashSecret);
  return expectedSignature === receivedSignature;
}

// Format date theo yyyyMMddHHmmss (yêu cầu của VNPay)
export function formatVNPayDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

// Format amount (nhân 100 vì VNPay dùng đơn vị nhỏ nhất)
export function formatVNPayAmount(amount: number): string {
  return String(Math.round(amount * 100));
}
