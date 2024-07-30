import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async createPaymentSession(): Promise<string> {
    return 'This action returns a new payment session';
  }

  async paymentSuccess(): Promise<string> {
    return 'Payment successful';
  }

  async paymentCancel(): Promise<string> {
    return 'Payment cancelled';
  }
}
