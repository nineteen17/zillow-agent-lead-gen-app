import { Request, Response } from 'express';
import { db } from '../config/database';
import { agentSubscriptions, agents } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { stripeService } from '../services/stripe.service';
import crypto from 'crypto';
import { z } from 'zod';

const addSuburbSchema = z.object({
  suburb: z.string(),
  tier: z.enum(['basic', 'premium', 'seller']),
});

const upgradeTierSchema = z.object({
  subscriptionId: z.string(),
  newTier: z.enum(['basic', 'premium', 'seller']),
});

const TIER_PRICING = {
  basic: 19900, // $199 in cents
  premium: 39900, // $399
  seller: 59900, // $599
};

const TIER_LEAD_CAPS = {
  basic: 10,
  premium: 50,
  seller: 999,
};

export class SubscriptionManagementController {
  /**
   * Get agent's subscriptions
   */
  async getAgentSubscriptions(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const subscriptions = await db.query.agentSubscriptions.findMany({
        where: eq(agentSubscriptions.agentId, agentId),
        orderBy: [agentSubscriptions.createdAt],
      });

      res.json(subscriptions);
    } catch (error: any) {
      console.error('Get agent subscriptions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Add new suburb subscription
   */
  async addSuburb(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { suburb, tier } = addSuburbSchema.parse(req.body);

      // Check if subscription already exists
      const existing = await db.query.agentSubscriptions.findFirst({
        where: and(
          eq(agentSubscriptions.agentId, agentId),
          eq(agentSubscriptions.suburb, suburb),
          eq(agentSubscriptions.isActive, true)
        ),
      });

      if (existing) {
        return res.status(400).json({ error: 'Already subscribed to this suburb' });
      }

      // Create Stripe subscription (if stripe service is available)
      // For MVP, we'll create the subscription directly
      const subscription = await db.insert(agentSubscriptions).values({
        id: crypto.randomUUID(),
        agentId,
        suburb,
        tier,
        monthlyPrice: TIER_PRICING[tier],
        leadCapPerMonth: TIER_LEAD_CAPS[tier],
        activeFrom: new Date(),
        isActive: true,
      }).returning();

      res.status(201).json(subscription[0]);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Add suburb error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove suburb subscription
   */
  async removeSuburb(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { subscriptionId } = req.params;

      // Verify subscription belongs to agent
      const subscription = await db.query.agentSubscriptions.findFirst({
        where: and(
          eq(agentSubscriptions.id, subscriptionId),
          eq(agentSubscriptions.agentId, agentId)
        ),
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Cancel subscription
      await db.update(agentSubscriptions)
        .set({
          isActive: false,
          activeTo: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(agentSubscriptions.id, subscriptionId));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Remove suburb error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Upgrade/downgrade subscription tier
   */
  async changeTier(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { subscriptionId, newTier } = upgradeTierSchema.parse(req.body);

      // Verify subscription belongs to agent
      const subscription = await db.query.agentSubscriptions.findFirst({
        where: and(
          eq(agentSubscriptions.id, subscriptionId),
          eq(agentSubscriptions.agentId, agentId)
        ),
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Update tier
      await db.update(agentSubscriptions)
        .set({
          tier: newTier,
          monthlyPrice: TIER_PRICING[newTier],
          leadCapPerMonth: TIER_LEAD_CAPS[newTier],
          updatedAt: new Date(),
        })
        .where(eq(agentSubscriptions.id, subscriptionId));

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Change tier error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get available suburbs
   */
  async getAvailableSuburbs(req: Request, res: Response) {
    try {
      // Get unique suburbs from properties table
      const { properties } = await import('../models/schema');
      const suburbs = await db
        .selectDistinct({ suburb: properties.suburb })
        .from(properties)
        .orderBy(properties.suburb);

      res.json(suburbs.map(s => s.suburb));
    } catch (error: any) {
      console.error('Get available suburbs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const subscriptionManagementController = new SubscriptionManagementController();
