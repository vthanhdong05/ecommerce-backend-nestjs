import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { Payment } from '@prisma/client';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import { SkipPermission } from '../auth/auth.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPaymentsPaginationDto } from './dto/get-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
