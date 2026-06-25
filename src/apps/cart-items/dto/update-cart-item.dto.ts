import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Chỉ cho phép sửa quantity — muốn đổi sản phẩm thì xóa item cũ, thêm item mới
export const UpdateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be greater than 0' }),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}
