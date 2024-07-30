import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  async createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  async success(): Promise<string> {
    return this.paymentsService.paymentSuccess();
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return this.paymentsService.paymentCancel();
  }
}
