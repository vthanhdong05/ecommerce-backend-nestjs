import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserInfo } from '../../../common/decorators/user.decorator';
import { File } from '../../../common/utils/excel-util/dto/excel-util.interface';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateProductImageSchema = z.object({
  name: z.string().trim().min(1, { message: 'Image name is required' }),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().url({ message: 'Invalid image URL' }),
  sortOrder: z.number().int().min(0).optional().default(0),
  productID: z.string().optional().nullable(),
  productVariantID: z.string().optional().nullable(),
});

export class CreateProductImageDto extends createZodDto(CreateProductImageSchema) {}

export class ImportProductImagesDto extends ImportExcel {}

export class UploadProductImagesDto {
  files!: File[];
  user!: UserInfo;
}
