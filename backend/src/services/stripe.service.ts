import Stripe from 'stripe';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import type { SubscriptionTier } from '../models/zod-schemas.js';

let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

export class StripeService {
  private subscriptionRepo: SubscriptionRepository;

  constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
  }

  /**
   * Create a subscription checkout session
   */
  async createSubscriptionCheckout(params: {
    agentId: string;
    agentEmail: string;
    suburb: string;
    tier: SubscriptionTier;
  }) {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const { agentId, agentEmail, suburb, tier } = params;

    // Define pricing (in cents)
    const pricing: Record<SubscriptionTier, number> = {
      basic: 9900, // $99/month
      premium: 24900, // $249/month
      seller: 49900, // $499/month
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - ${suburb}`,
              description: `Premier Agent subscription for ${suburb}`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: pricing[tier],
          },
          quantity: 1,
        },
      ],
      customer_email: agentEmail,
      metadata: {
        agentId,
        suburb,
        tier,
      },
      success_url: `${env.API_URL}/dashboard/agent/subscriptions?success=true`,
      cancel_url: `${env.API_URL}/dashboard/agent/subscriptions?canceled=true`,
    });

    logger.info(`Stripe checkout session created for agent ${agentId}`);

    return session;
  }

  /**
   * Handle subscription webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    logger.info(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { agentId, suburb, tier } = session.metadata as {
      agentId: string;
      suburb: string;
      tier: SubscriptionTier;
    };

    const subscriptionId = session.subscription as string;

    // Create subscription in database
    const pricing: Record<SubscriptionTier, { price: number; leadCap: number }> = {
      basic: { price: 99, leadCap: 10 },
      premium: { price: 249, leadCap: 50 },
      seller: { price: 499, leadCap: 999 },
    };

    await this.subscriptionRepo.create({
      agentId,
      suburb,
      tier,
      monthlyPrice: pricing[tier].price,
      leadCapPerMonth: pricing[tier].leadCap,
      activeFrom: new Date(),
      activeTo: null,
      stripeSubscriptionId: subscriptionId,
      isActive: true,
    });

    logger.info(`Subscription created for agent ${agentId} in ${suburb} (${tier})`);
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const dbSubscription = await this.subscriptionRepo.findByStripeSubscriptionId(subscription.id);

    if (!dbSubscription) {
      logger.warn(`Subscription not found in database: ${subscription.id}`);
      return;
    }

    // Update subscription status if canceled
    if (subscription.status === 'canceled') {
      await this.subscriptionRepo.deactivate(dbSubscription.id);
      logger.info(`Subscription deactivated: ${dbSubscription.id}`);
    }
  }

  /**
   * Handle subscription deletion
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const dbSubscription = await this.subscriptionRepo.findByStripeSubscriptionId(subscription.id);

    if (!dbSubscription) {
      logger.warn(`Subscription not found in database: ${subscription.id}`);
      return;
    }

    await this.subscriptionRepo.deactivate(dbSubscription.id);
    logger.info(`Subscription deleted: ${dbSubscription.id}`);
  }

  /**
   * Handle payment failure
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    logger.warn(`Payment failed for subscription: ${invoice.subscription}`);
    // TODO: Send notification to agent about payment failure
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string) {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const dbSubscription = await this.subscriptionRepo.findById(subscriptionId);

    if (!dbSubscription || !dbSubscription.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    await stripe.subscriptions.cancel(dbSubscription.stripeSubscriptionId);
    await this.subscriptionRepo.deactivate(subscriptionId);

    logger.info(`Subscription canceled: ${subscriptionId}`);
  }
}
