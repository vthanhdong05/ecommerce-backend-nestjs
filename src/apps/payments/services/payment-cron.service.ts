import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from '../payments.service';

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);

  constructor(private paymentsService: PaymentsService) {}

  // (Cron job chạy mỗi giờ - cancel pending payments quá hạn 24h)
  @Cron(CronExpression.EVERY_HOUR)
  async cancelExpiredPayments() {
    try {
      const count = await this.paymentsService.cancelExpiredPayments();
      if (count > 0) {
        this.logger.log(`Cancelled ${count} expired payments`);
      }
    } catch (error) {
      this.logger.error(`Failed to cancel expired payments: ${(error as Error).message}`);
    }
  }

  // (Cron job chạy mỗi 30 phút - log thống kê, optional)
  @Cron(CronExpression.EVERY_30_MINUTES)
  logPendingStats() {
    try {
      // Có thể thêm query đếm payment pending
      this.logger.debug('Pending payment stats check');
    } catch (error) {
      this.logger.error(`Failed to log pending stats: ${(error as Error).message}`);
    }
  }
}
