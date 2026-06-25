import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateCartItemSchema = z.object({
  productVariantID: z.string().uuid({ message: 'Invalid product variant id' }),
  quantity: z.coerce.number().int().positive({ message: 'Quantity must be greater than 0' }),
});

export class CreateCartItemDto extends createZodDto(CreateCartItemSchema) {}
