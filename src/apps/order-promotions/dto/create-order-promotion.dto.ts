import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Không phải input từ client — chỉ dùng nội bộ trong OrdersService.createOrder (trong transaction)
// Client gửi code (string), Service validate + tính toán rồi mới tạo OrderPromotion
export const CreateOrderPromotionSchema = z.object({
  orderID: z.string().uuid({ message: 'Invalid order id' }),
  promotionID: z.string().uuid({ message: 'Invalid promotion id' }),
  discountAmount: z.coerce.number().min(0),
});

export class CreateOrderPromotionDto extends createZodDto(CreateOrderPromotionSchema) {}
