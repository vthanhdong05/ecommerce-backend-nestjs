import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Payment } from '@prisma/client';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import { SkipPermission } from '../auth/auth.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsPaginationDto } from './dto/get-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';
import { VNPayService } from './services/vnpay.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly vnpayService: VNPayService,
  ) {}

  @Post()
  @SkipPermission()
  createPayment(@Body() dto: CreatePaymentDto, @User() user: UserInfo) {
    return this.paymentsService.createPayment(dto, user);
  }

  @Get()
  @SkipPermission()
  @UsePipes(ParseParamsPaginationPipe)
  getPayments(@Query() query: GetPaymentsPaginationDto, @User() user: UserInfo) {
    return this.paymentsService.getPayments({ ...query, userID: user.userID });
  }

  @Get(':id/checkout-url')
  @SkipPermission()
  async getCheckoutUrl(
    @Param('id') id: Payment['id'],
    @User() user: UserInfo,
    @Req() req: Request,
  ) {
    await this.paymentsService.getPayment(id, user.userID);
    const ipAddr =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      (req as any).socket?.remoteAddress ??
      '127.0.0.1';
    const url = await this.vnpayService.createPaymentUrl(id, ipAddr);
    return { url };
  }

  @Get('vnpay/return')
  async vnpayReturn(@Query() query: Record<string, string>, @Res() res: Response) {
    try {
      const result = await this.vnpayService.handleCallback(query);
      const paymentID = result.paymentID;
      const isSuccess = result.responseCode === '00';

      const response = res as any;
      const frontendUrl = `${process.env.FRONTEND_URL ?? 'https://your-frontend.com'}/payment/result?status=${isSuccess ? 'success' : 'failed'}&paymentID=${paymentID}`;
      return response.redirect(frontendUrl);
    } catch {
      // Sửa: không có `err`
      const response = res as any;
      const frontendUrl = `${process.env.FRONTEND_URL ?? 'https://your-frontend.com'}/payment/result?status=error`;
      return response.redirect(frontendUrl);
    }
  }

  @Post('vnpay/ipn')
  @HttpCode(HttpStatus.OK)
  async vnpayIpn(@Body() body: Record<string, string>) {
    try {
      const result = await this.vnpayService.handleCallback(body);
      return {
        RspCode: '00',
        Message: 'Success',
        paymentID: result.paymentID,
      };
    } catch {
      return {
        RspCode: '97',
        Message: 'Invalid signature',
      };
    }
  }

  @Get(':id')
  @SkipPermission()
  getPayment(@Param('id') id: Payment['id'], @User() user: UserInfo) {
    return this.paymentsService.getPayment(id, user.userID);
  }

  @Patch(':id')
  @SkipPermission()
  updatePayment(@Param('id') id: Payment['id'], @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.updatePayment(id, dto);
  }

  @Patch(':id/refund')
  @SkipPermission()
  refundPayment(@Param('id') id: Payment['id'], @Body('reason') reason: string) {
    return this.paymentsService.refundPayment(id, reason);
  }
}
