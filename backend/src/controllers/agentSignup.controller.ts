import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth } from '../config/auth.js';
import { AgentService } from '../services/agent.service.js';
import { StripeService } from '../services/stripe.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { subscriptionTierSchema } from '../models/zod-schemas.js';
import { logger } from '../config/logger.js';
import { emailQueue } from '../config/bullmq.js';

const router = Router();
const agentService = new AgentService();
const stripeService = new StripeService();

// Agent signup schema
const agentSignupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(1, 'Phone is required'),
  agencyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  tier: subscriptionTierSchema,
  suburbs: z.array(z.string()).min(1, 'At least one suburb is required'),
});

/**
 * @swagger
 * /api/agent/signup:
 *   post:
 *     summary: Public agent signup endpoint - creates user, agent profile, and Stripe checkout
 *     tags: [Agent Signup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - tier
 *               - suburbs
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: mypassword123
 *               phone:
 *                 type: string
 *                 example: 021 123 4567
 *               agencyName:
 *                 type: string
 *                 example: Premium Realty
 *               licenseNumber:
 *                 type: string
 *                 example: REAA123456
 *               tier:
 *                 type: string
 *                 enum: [basic, premium, seller]
 *                 example: premium
 *               suburbs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: [Albany, Browns Bay]
 *     responses:
 *       200:
 *         description: Signup successful, returns Stripe checkout URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 checkoutUrl:
 *                   type: string
 *                 agentId:
 *                   type: string
 *       400:
 *         description: Validation error or email already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/signup',
  validateBody(agentSignupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        agencyName,
        licenseNumber,
        tier,
        suburbs,
      } = req.body;

      logger.info(`Agent signup attempt for email: ${email}`);

      // Step 1: Create user account with BetterAuth
      const signUpResult = await auth.api.signUp({
        body: {
          name,
          email,
          password,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new AppError(400, 'Failed to create user account. Email may already exist.');
      }

      const userId = signUpResult.user.id;

      logger.info(`User created with ID: ${userId}`);

      try {
        // Step 2: Update user role to 'agent'
        // Note: BetterAuth doesn't have a direct API for this, so we'll need to update the database directly
        const { db } = await import('../config/database.js');
        const { users } = await import('../models/schema.js');
        const { eq } = await import('drizzle-orm');

        await db
          .update(users)
          .set({ role: 'agent' })
          .where(eq(users.id, userId));

        logger.info(`User role updated to 'agent' for user ${userId}`);

        // Step 3: Create agent profile
        const agent = await agentService.createAgent({
          userId,
          name,
          email,
          phone,
          agencyName: agencyName || null,
          licenseNumber: licenseNumber || null,
          regions: suburbs,
          profileBio: null,
          photoUrl: null,
          isActive: true,
        });

        logger.info(`Agent profile created with ID: ${agent.id}`);

        // Step 4: Create Stripe checkout session
        // We'll create one session with the first suburb, and subscriptions for other suburbs can be added later
        const primarySuburb = suburbs[0];
        const session = await stripeService.createSubscriptionCheckout({
          agentId: agent.id,
          agentEmail: email,
          suburb: primarySuburb,
          tier,
        });

        logger.info(`Stripe checkout session created for agent ${agent.id}`);

        // Send welcome email (async, don't wait)
        await emailQueue.add('agent-welcome', {
          type: 'agent-welcome',
          data: {
            agentEmail: email,
            agentName: name,
          },
        });
        logger.info(`Welcome email queued for agent ${email}`);

        res.json({
          success: true,
          message: 'Account created successfully. Redirecting to payment...',
          checkoutUrl: session.url,
          agentId: agent.id,
          sessionId: session.id,
        });
      } catch (error) {
        // If agent creation or Stripe fails, we should ideally rollback the user creation
        // For now, log the error - the user exists but agent profile failed
        logger.error(`Failed to complete agent signup for user ${userId}:`, error);
        throw new AppError(500, 'Failed to complete signup. Please contact support.');
      }
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        // Check if it's a BetterAuth error (email already exists, etc.)
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          next(new AppError(400, 'Email address already registered'));
        } else {
          logger.error('Agent signup error:', error);
          next(new AppError(500, 'An error occurred during signup'));
        }
      } else {
        next(new AppError(500, 'An unexpected error occurred'));
      }
    }
  }
);

export default router;
