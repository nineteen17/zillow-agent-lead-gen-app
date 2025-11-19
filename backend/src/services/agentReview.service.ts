import { db } from '../config/database';
import { agentReviews, agents } from '../models/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

export class AgentReviewService {
  /**
   * Create a new review for an agent
   */
  async createReview(params: {
    agentId: string;
    userId?: string;
    leadId?: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<{ id: string }> {
    if (params.rating < 1 || params.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = await db.insert(agentReviews).values({
      id: crypto.randomUUID(),
      agentId: params.agentId,
      userId: params.userId,
      leadId: params.leadId,
      rating: params.rating,
      title: params.title,
      comment: params.comment,
      isVerified: !!params.leadId, // Verified if linked to a lead
    }).returning();

    return { id: review[0].id };
  }

  /**
   * Get all reviews for an agent
   */
  async getAgentReviews(agentId: string, includeUnpublished = false) {
    const conditions = [eq(agentReviews.agentId, agentId)];

    if (!includeUnpublished) {
      conditions.push(eq(agentReviews.isPublished, true));
    }

    return await db.query.agentReviews.findMany({
      where: and(...conditions),
      orderBy: [desc(agentReviews.createdAt)],
      with: {
        user: {
          columns: {
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Get agent rating statistics
   */
  async getAgentRatingStats(agentId: string) {
    const stats = await db
      .select({
        totalReviews: sql<number>`count(*)::int`,
        averageRating: sql<number>`round(avg(${agentReviews.rating})::numeric, 2)`,
        rating5: sql<number>`count(*) filter (where ${agentReviews.rating} = 5)::int`,
        rating4: sql<number>`count(*) filter (where ${agentReviews.rating} = 4)::int`,
        rating3: sql<number>`count(*) filter (where ${agentReviews.rating} = 3)::int`,
        rating2: sql<number>`count(*) filter (where ${agentReviews.rating} = 2)::int`,
        rating1: sql<number>`count(*) filter (where ${agentReviews.rating} = 1)::int`,
      })
      .from(agentReviews)
      .where(
        and(
          eq(agentReviews.agentId, agentId),
          eq(agentReviews.isPublished, true)
        )
      )
      .groupBy(agentReviews.agentId);

    return stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0,
    };
  }

  /**
   * Agent responds to a review
   */
  async respondToReview(reviewId: string, agentId: string, response: string) {
    const review = await db.query.agentReviews.findFirst({
      where: eq(agentReviews.id, reviewId),
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.agentId !== agentId) {
      throw new Error('Not authorized to respond to this review');
    }

    await db.update(agentReviews)
      .set({
        agentResponse: response,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentReviews.id, reviewId));
  }

  /**
   * Publish or unpublish a review
   */
  async updateReviewVisibility(reviewId: string, isPublished: boolean) {
    await db.update(agentReviews)
      .set({ isPublished, updatedAt: new Date() })
      .where(eq(agentReviews.id, reviewId));
  }

  /**
   * Get top-rated agents in a suburb
   */
  async getTopRatedAgents(suburb: string, limit = 10) {
    const topAgents = await db
      .select({
        agentId: agentReviews.agentId,
        averageRating: sql<number>`round(avg(${agentReviews.rating})::numeric, 2)`,
        totalReviews: sql<number>`count(*)::int`,
      })
      .from(agentReviews)
      .innerJoin(agents, eq(agents.id, agentReviews.agentId))
      .where(eq(agentReviews.isPublished, true))
      .groupBy(agentReviews.agentId)
      .having(sql`count(*) >= 3`) // At least 3 reviews
      .orderBy(desc(sql`avg(${agentReviews.rating})`))
      .limit(limit);

    return topAgents;
  }
}

export const agentReviewService = new AgentReviewService();
