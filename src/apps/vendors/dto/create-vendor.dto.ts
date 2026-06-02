import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateVendorSchema = z.object({
  name: z.string().trim().min(1, { message: 'Vendor name is required' }),
  description: z.string().trim().optional().nullable(),
  logoUrl: z.string().trim().url({ message: 'Invalid logo URL' }).optional().nullable(),
  taxCode: z.string().trim().optional().nullable(),
});

export class CreateVendorDto extends createZodDto(CreateVendorSchema) {}

export class ImportVendorsDto extends ImportExcel {}
