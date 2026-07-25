import { RoleType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ImportExcel } from '../../../common/utils/excel-util/excel-util.const';

export const CreateRoleSchema = z.object({
  name: z.string().trim().min(2, { message: 'Role name must be at least 2 characters' }),
  description: z.string().trim().optional().nullable(),
  roleType: z.nativeEnum(RoleType).optional(),
  // Danh sách permissionID gán cho role lúc tạo. Optional — không truyền = tạo role không có permission.
  permissionIDs: z.array(z.string().uuid()).optional(),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}

export class ImportRolesDto extends ImportExcel {}
