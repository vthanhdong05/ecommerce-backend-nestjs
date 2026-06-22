import { PromotionStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// Chỉ cho phép sửa các field an toàn — không cho đổi type/scope/value/code vì ảnh hưởng OrderPromotion đã tạo
export const UpdatePromotionSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    startDate: z.string().datetime().optional(), // đổi từ z.coerce.date()
    endDate: z.string().datetime().optional().nullable(), // đổi từ z.coerce.date()
    status: z.nativeEnum(PromotionStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    { message: 'End date must be after start date' },
  );

export class UpdatePromotionDto extends createZodDto(UpdatePromotionSchema) {}
