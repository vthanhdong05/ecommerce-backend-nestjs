import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(2, {
    message: 'Category name must be at least 2 characters',
  }),
  slug: z.string().trim().min(1, {
    message: 'Slug is required',
  }),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export class ImportCategoriesDto extends ImportExcel {}
