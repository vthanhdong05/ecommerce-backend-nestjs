import { Module } from '@nestjs/common';

import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { UserSystemRolesService } from './user-system-roles.service';
import { UserSystemRolesController } from './user-system-roles.controller';

@Module({
  imports: [ExcelUtilModule, UsersModule, RolesModule],
  controllers: [UserSystemRolesController],
  providers: [UserSystemRolesService],
})
export class UserSystemRolesModule {}
