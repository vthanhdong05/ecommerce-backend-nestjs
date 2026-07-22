import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const IS_SKIP_AUTH = 'IS_SKIP_AUTH';
export const SkipAuth = () => SetMetadata(IS_SKIP_AUTH, true);

export const IS_SKIP_PERMISSION = 'IS_SKIP_USER_PROFILE';
export const SkipPermission = () => SetMetadata(IS_SKIP_PERMISSION, true);

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
