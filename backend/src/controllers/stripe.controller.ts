import express, { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();
const stripeService = new StripeService();

/**
 * @swagger
 * /api/stripe/create-checkout:
 *   post:
 *     summary: Create a Stripe checkout session for agent subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suburb:
 *                 type: string
 *               tier:
 *                 type: string
 *                 enum: [basic, premium, seller]
 *     responses:
 *       200:
 *         description: Checkout session created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/create-checkout',
  requireAuth,
  requireRole('agent'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { suburb, tier } = req.body;
      const agent = req.user?.agent;

      if (!agent) {
        throw new AppError(400, 'Agent profile not found');
      }

      if (!suburb || !tier) {
        throw new AppError(400, 'Suburb and tier are required');
      }

      const session = await stripeService.createSubscriptionCheckout({
        agentId: agent.id,
        agentEmail: agent.email,
        suburb,
        tier,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook signature
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.headers['stripe-signature'];

      if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
        throw new AppError(400, 'Missing signature or webhook secret');
      }

      let event: Stripe.Event;

      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-12-18.acacia',
        });

        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        logger.error('Webhook signature verification failed:', err.message);
        throw new AppError(400, `Webhook Error: ${err.message}`);
      }

      // Handle the event
      await stripeService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/stripe/cancel-subscription/{id}:
 *   post:
 *     summary: Cancel an agent subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription canceled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.post(
  '/cancel-subscription/:id',
  requireAuth,
  requireRole('agent'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const agent = req.user?.agent;

      if (!agent) {
        throw new AppError(400, 'Agent profile not found');
      }

      await stripeService.cancelSubscription(id);

      res.json({
        success: true,
        message: 'Subscription canceled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
