import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreatePermissionSchema = z.object({
  name: z.string().trim().min(1, { message: 'Permission name is required' }),
  description: z.string().trim().optional().nullable(),
  key: z.string().trim().min(1, { message: 'Permission key is required' }),
  isSystemPermission: z.boolean().optional().default(false),
});

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}

export class ImportPermissionsDto extends ImportExcel {}
