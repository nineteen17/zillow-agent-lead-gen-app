import { Request, Response } from 'express';
import { db } from '../config/database';
import { agents, agentSubscriptions, agentReviews } from '../models/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { agentReviewService } from '../services/agentReview.service';

export class AgentProfileController {
  /**
   * Get public agent profile
   */
  async getPublicProfile(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      // Get agent details
      const agent = await db.query.agents.findFirst({
        where: eq(agents.id, agentId),
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          agencyName: true,
          licenseNumber: true,
          profileBio: true,
          photoUrl: true,
          createdAt: true,
        },
      });

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Get active subscriptions (suburbs)
      const subscriptions = await db.query.agentSubscriptions.findMany({
        where: and(
          eq(agentSubscriptions.agentId, agentId),
          eq(agentSubscriptions.isActive, true)
        ),
        columns: {
          suburb: true,
          tier: true,
        },
      });

      // Get rating stats
      const ratingStats = await agentReviewService.getAgentRatingStats(agentId);

      // Get recent reviews
      const reviews = await agentReviewService.getAgentReviews(agentId);

      res.json({
        agent,
        suburbs: subscriptions.map(s => s.suburb),
        subscriptions,
        ratingStats,
        reviews: reviews.slice(0, 10), // Most recent 10 reviews
      });
    } catch (error: any) {
      console.error('Get public profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all agents (public listing)
   */
  async getAgents(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const suburb = req.query.suburb as string;

      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: agents.id,
          name: agents.name,
          agencyName: agents.agencyName,
          photoUrl: agents.photoUrl,
          profileBio: agents.profileBio,
          averageRating: sql<number>`(
            SELECT COALESCE(ROUND(AVG(${agentReviews.rating})::numeric, 2), 0)
            FROM ${agentReviews}
            WHERE ${agentReviews.agentId} = ${agents.id}
              AND ${agentReviews.isPublished} = true
          )`,
          reviewCount: sql<number>`(
            SELECT COUNT(*)::int
            FROM ${agentReviews}
            WHERE ${agentReviews.agentId} = ${agents.id}
              AND ${agentReviews.isPublished} = true
          )`,
        })
        .from(agents)
        .where(eq(agents.isActive, true));

      // Filter by suburb if provided
      if (suburb) {
        query = query
          .innerJoin(
            agentSubscriptions,
            and(
              eq(agentSubscriptions.agentId, agents.id),
              eq(agentSubscriptions.suburb, suburb),
              eq(agentSubscriptions.isActive, true)
            )
          ) as any;
      }

      const agentsList = await query.limit(limit).offset(offset);

      res.json({
        agents: agentsList,
        page,
        limit,
        hasMore: agentsList.length === limit,
      });
    } catch (error: any) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update agent profile (authenticated agent only)
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, phone, agencyName, licenseNumber, profileBio, photoUrl } = req.body;

      await db.update(agents)
        .set({
          name,
          phone,
          agencyName,
          licenseNumber,
          profileBio,
          photoUrl,
          updatedAt: new Date(),
        })
        .where(eq(agents.id, agentId));

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const agentProfileController = new AgentProfileController();
