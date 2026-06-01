import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PaginationUtilService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
