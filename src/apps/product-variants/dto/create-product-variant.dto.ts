import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateProductVariantSchema = z.object({
  name: z.string().trim().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive({ message: 'Price must be greater than 0' }),
  stockQuantity: z.coerce.number().int().min(0).optional().default(0),
  attributes: z.record(z.string(), z.unknown()).optional().nullable(),
  productID: z.string().uuid({ message: 'Invalid product id' }),
});

export const CreateVendorProductVariantSchema = CreateProductVariantSchema.omit({
  productID: true,
});

export class CreateProductVariantDto extends createZodDto(CreateProductVariantSchema) {}
export class CreateVendorProductVariantDto extends createZodDto(CreateVendorProductVariantSchema) {}

export class ImportProductVariantsDto extends ImportExcel {}
