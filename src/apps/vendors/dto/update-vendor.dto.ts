import { createZodDto } from 'nestjs-zod';
import { CreateVendorSchema } from './create-vendor.dto';

export const UpdateVendorSchema = CreateVendorSchema.partial();

export class UpdateVendorDto extends createZodDto(UpdateVendorSchema) {}
