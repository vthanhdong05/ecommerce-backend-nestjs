import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateProductSchema } from './create-product.dto';

// Partial schema for PATCH — mọi field optional.
// `categoryIDs` bỏ `.min(1)` ở create (vì partial — không bắt buộc gửi categories khi update),
// service sẽ tự quyết định có sync hay không dựa trên việc field có được gửi lên hay không.
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  categoryIDs: z.array(z.string().uuid()).optional(),
});

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
