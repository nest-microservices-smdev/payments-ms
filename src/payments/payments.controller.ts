import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  async createPaymentSession() {
    return this.paymentsService.createPaymentSession();
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
