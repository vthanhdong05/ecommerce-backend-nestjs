import { Module } from '@nestjs/common';
import { ExcelUtilModule } from '../../common/utils/excel-util/excel-util.module';
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [ExcelUtilModule],
  controllers: [RolesController],
  providers: [RolesService, PaginationUtilService],
  exports: [RolesService],
})
export class RolesModule {}
