import z from 'zod';
import { FormatResponseSchema } from '../../utils/api-util/dto/api-util.dto';

// (giúp tái sử dụng FormatResponseSchema và bổ sung validation chi tiết cho phần data)
export const withResponse = <T extends z.ZodTypeAny>(schema: T) =>
  FormatResponseSchema.extend({
    data: schema,
  });
