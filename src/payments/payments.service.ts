import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from 'src/config';
import {
  PaymentSessionDto,
  PaymentSessionItemDto,
} from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';
import { NotifyPaidOrderDto } from './dto/notify-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeScretKey);
  private readonly logger = new Logger('PaymentsService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { orderId, currency, items } = paymentSessionDto;

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items: this.formatListItems(currency, items),
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
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

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        envs.stripeEndpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;

        const payload: NotifyPaidOrderDto = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url,
        };

        this.logger.log(`Payment successful: ${JSON.stringify(payload)}`);

        this.client.emit({ cmd: 'payment.succeeded' }, payload);
        break;

      default:
        console.log('Event no handled');
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
