import { createZodDto } from 'nestjs-zod';
import { ImportExcel } from 'src/common/utils/excel-util/excel-util.const';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().trim().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'First name must be at least 2 characters' })
    .optional()
    .nullable(),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .optional()
    .nullable(),
  fullAddress: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, { message: 'Invalid phone number' })
    .optional()
    .nullable(),
});

// Đổi từ z.infer sang createZodDto
export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export class ImportUsersDto extends ImportExcel {}
