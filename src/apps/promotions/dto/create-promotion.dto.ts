import { PromotionScope, PromotionStatus, PromotionType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreatePromotionSchema = z
  .object({
    code: z.string().trim().min(1, { message: 'Promotion code is required' }).toUpperCase(),
    name: z.string().trim().min(2, { message: 'Promotion name must be at least 2 characters' }),
    description: z.string().trim().optional().nullable(),
    type: z.nativeEnum(PromotionType),
    scope: z.nativeEnum(PromotionScope),
    value: z.coerce.number().positive({ message: 'Value must be greater than 0' }),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(PromotionStatus).optional(),
  })
  .refine(
    (data) => {
      // buy_x_get_y chỉ hợp lệ với scope ORDER — không có nghĩa khi áp vào phí ship
      if (data.type === PromotionType.buy_x_get_y && data.scope === PromotionScope.SHIPPING) {
        return false;
      }
      return true;
    },
    { message: 'buy_x_get_y promotion type cannot be applied to SHIPPING scope' },
  )
  .refine(
    (data) => {
      // percentage không được vượt quá 100
      if (data.type === PromotionType.percentage && data.value > 100) {
        return false;
      }
      return true;
    },
    { message: 'Percentage value cannot exceed 100' },
  )
  .refine(
    (data) => {
      // endDate phải sau startDate nếu có
      if (data.endDate && data.startDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    { message: 'End date must be after start date' },
  );

export class CreatePromotionDto extends createZodDto(CreatePromotionSchema) {}
