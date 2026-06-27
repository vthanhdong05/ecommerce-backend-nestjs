import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsService } from './role-permissions.service';

@Module({
  imports: [ExcelUtilModule, RolesModule, PermissionsModule, UsersModule],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule {}
