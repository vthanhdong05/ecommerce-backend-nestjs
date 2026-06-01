import { createZodDto } from 'nestjs-zod';
import { CreatePermissionSchema } from './create-permission.dto';

export const UpdatePermissionSchema = CreatePermissionSchema.partial();

export class UpdatePermissionDto extends createZodDto(UpdatePermissionSchema) {}
