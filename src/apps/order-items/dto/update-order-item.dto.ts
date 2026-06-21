import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Chỉ cho phép sửa snapshot (vd: sửa lỗi hiển thị tên sản phẩm sai do bug lúc tạo)
// KHÔNG cho sửa quantity/unitPrice/totalPrice qua DTO này — đổi số lượng phải qua luồng cancel + tạo lại đơn
export const UpdateOrderItemSchema = z.object({
  productVariantSnapshot: z.unknown().optional(),
});

export class UpdateOrderItemDto extends createZodDto(UpdateOrderItemSchema) {}
