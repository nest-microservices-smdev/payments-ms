import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeScretKey);

  async createPaymentSession() {
    return this.stripe.checkout.sessions.create({
      // TODO add payment session data: id of the order
      payment_intent_data: {
        metadata: {},
      },

      // TODO add payment session data: list of the products and their prices
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3004/payments/success',
      cancel_url: 'http://localhost:3004/payments/cancel',
    });
  }

  async paymentSuccess(): Promise<string> {
    return 'Payment successful';
  }

  async paymentCancel(): Promise<string> {
    return 'Payment cancelled';
  }
}
