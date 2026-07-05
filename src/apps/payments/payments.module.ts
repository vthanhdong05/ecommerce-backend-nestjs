import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { VNPayService } from './services/vnpay.service';
import { PaginationUtilService } from 'src/common/utils/pagination-util/pagination-util.service';

@Module({
  imports: [PrismaModule, ConfigModule, ScheduleModule.forRoot()],
  controllers: [PaymentsController],
  providers: [PaymentsService, VNPayService, PaginationUtilService],
  exports: [PaymentsService, VNPayService],
})
export class PaymentsModule {}
