import { OrderStatus } from '@prisma/client';

// (State machine — Vendor chỉ được đổi status theo đúng thứ tự, không nhảy cóc)
export const ALLOWED_VENDOR_STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  [OrderStatus.confirmed]: [OrderStatus.processing],
  [OrderStatus.processing]: [OrderStatus.shipped],
  [OrderStatus.shipped]: [OrderStatus.delivered],
};
