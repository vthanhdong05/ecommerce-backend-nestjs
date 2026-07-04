import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { VNPayService } from './services/vnpay.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, VNPayService],
  exports: [PaymentsService, VNPayService],
})
export class PaymentsModule {}
