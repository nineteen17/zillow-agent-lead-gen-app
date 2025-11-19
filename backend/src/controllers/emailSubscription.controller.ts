import { Router, Request, Response, NextFunction } from 'express';
import { EmailSubscriptionService } from '../services/emailSubscription.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { z } from 'zod';

const router = Router();
const subscriptionService = new EmailSubscriptionService();

const subscribeSchema = z.object({
  email: z.string().email(),
  suburb: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  alertTypes: z.array(z.enum(['price_change', 'new_sales', 'market_trends'])).min(1),
});

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Subscribe to email alerts
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               suburb:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               alertTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = subscribeSchema.parse(req.body);
    const subscription = await subscriptionService.subscribe(data);

    res.status(201).json({
      message: 'Subscription created. Please check your email to verify.',
      subscriptionId: subscription.id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/subscriptions/verify:
 *   get:
 *     summary: Verify email subscription
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.get('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError(400, 'Verification token is required');
    }

    await subscriptionService.verify(token);

    res.json({ message: 'Email verified successfully. You will now receive alerts.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/subscriptions/unsubscribe:
 *   get:
 *     summary: Unsubscribe from email alerts
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
router.get('/unsubscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError(400, 'Unsubscribe token is required');
    }

    await subscriptionService.unsubscribe(token);

    res.json({ message: 'You have been unsubscribed from email alerts.' });
  } catch (error) {
    next(error);
  }
});

export default router;
