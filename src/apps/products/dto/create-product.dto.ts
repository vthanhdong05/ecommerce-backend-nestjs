import { ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { ImportExcel } from 'src/common/utils/excel-util/excel-util.const';
import z from 'zod';

// Schema cho Admin — cần vendorID trong body
export const CreateProductSchema = z.object({
  name: z.string().trim().min(2, { message: 'Product name must be at least 2 characters' }),
  description: z.string().trim().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive({ message: 'Price must be greater than 0' }),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  vendorID: z.string().uuid({ message: 'Invalid vendor id' }),
});

// Schema cho Vendor — không cần vendorID (lấy từ URL)
export const CreateVendorProductSchema = CreateProductSchema.omit({ vendorID: true });

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class CreateVendorProductDto extends createZodDto(CreateVendorProductSchema) {}

export class ImportProductsDto extends ImportExcel {}
