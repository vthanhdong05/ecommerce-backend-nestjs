import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// 1 item muốn mua — Service tự lấy giá thật từ ProductVariant trong DB, không tin giá client gửi
const OrderItemInputSchema = z.object({
  productVariantID: z.string().uuid({ message: 'Invalid product variant id' }),
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be greater than 0' }),
});

// Địa chỉ giao hàng — optional, không gửi thì Service lấy mặc định từ User profile
const OrderAddressInputSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  fullAddress: z.string().trim().min(1),
  city: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  phone: z.string().trim().min(1),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1, { message: 'At least one item is required' }),
  shippingAddress: OrderAddressInputSchema.optional(),
  promotionCode: z.string().trim().optional(), // mã giảm giá đơn hàng (scope: ORDER)
  shippingPromotionCode: z.string().trim().optional(), // mã giảm phí ship (scope: SHIPPING)
  notes: z.string().trim().optional().nullable(),
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}
