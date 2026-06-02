import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { UserVendorRolesController } from './user-vendor-roles.controller';
import { UserVendorRolesService } from './user-vendor-roles.service';
import { VendorMembersController } from './vendor-member.controller';

@Module({
  imports: [ExcelUtilModule, UsersModule, VendorsModule, RolesModule],
  controllers: [UserVendorRolesController, VendorMembersController],
  providers: [UserVendorRolesService],
})
export class UserVendorRolesModule {}
