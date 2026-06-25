import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Không dùng cho API public — Cart tự động tạo qua getOrCreateCart(userID)
// DTO này chỉ dùng nội bộ trong CartService.getOrCreateCart
export const CreateCartSchema = z.object({
  userID: z.string().uuid({ message: 'Invalid user id' }),
});

export class CreateCartDto extends createZodDto(CreateCartSchema) {}
