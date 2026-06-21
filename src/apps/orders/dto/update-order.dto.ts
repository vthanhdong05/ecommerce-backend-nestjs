import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Chỉ cho phép sửa notes sau khi đơn đã tạo — không cho sửa items/address/giá
// Đổi status phải qua endpoint riêng (cancelOrder / updateVendorOrderStatus), không qua DTO này
export const UpdateOrderSchema = z.object({
  notes: z.string().trim().optional().nullable(),
});

export class UpdateOrderDto extends createZodDto(UpdateOrderSchema) {}
