import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  redirectTo: z.string().url(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// DTO extends từ Zod schema
export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
