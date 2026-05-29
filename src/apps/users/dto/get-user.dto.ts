import { z } from 'zod';

export const GetUserSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type GetUserDto = z.infer<typeof GetUserSchema>;
