import { ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateProductSchema = z.object({
  name: z.string().trim().min(2, {
    message: 'Product name must be at least 2 characters',
  }),
  description: z.string().trim().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive({
    message: 'Price must be greater than 0',
  }),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  vendorID: z.string().uuid({
    message: 'Invalid vendor id',
  }),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export class ImportProductsDto extends ImportExcel {}
