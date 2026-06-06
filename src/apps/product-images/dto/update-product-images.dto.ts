import { createZodDto } from 'nestjs-zod';
import { CreateProductImageSchema } from './create-product-images.dto';

export const UpdateProductImageSchema = CreateProductImageSchema.partial();

export class UpdateProductImageDto extends createZodDto(UpdateProductImageSchema) {}
