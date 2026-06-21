import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Input từ client cho 1 item muốn mua — chỉ cần biết mua gì, số lượng bao nhiêu
// unitPrice, totalPrice, vendorID, productVariantSnapshot đều do Service tự tính/lấy từ DB, không nhận từ client
export const CreateOrderItemSchema = z.object({
  orderID: z.string().uuid({ message: 'Invalid order id' }),
  productVariantID: z.string().uuid({ message: 'Invalid product variant id' }),
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be greater than 0' }),
});

export class CreateOrderItemDto extends createZodDto(CreateOrderItemSchema) {}
