import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from 'src/config';
import {
  PaymentSessionDto,
  PaymentSessionItemDto,
} from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { request } from 'http';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeScretKey);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto;

    return this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {},
      },
      line_items: this.formatListItems(currency, items),
      mode: 'payment',
      success_url: 'http://localhost:3004/payments/success',
      cancel_url: 'http://localhost:3004/payments/cancel',
    });
  }

  formatListItems(currency: string, items: PaymentSessionItemDto[]) {
    return items.map(({ name, price, quantity }) => ({
      price_data: {
        currency,
        product_data: {
          name: name,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: quantity,
    }));
  }

  async stripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'];

    let event: Stripe.Event;
    const endpointSecret = '';

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }

    return res.status(200).json({ signature });
  }

  async paymentSuccess(): Promise<string> {
    return 'Payment successful';
  }

  async paymentCancel(): Promise<string> {
    return 'Payment cancelled';
  }
}
