import { Request, Response } from 'express';
import { agentReviewService } from '../services/agentReview.service';
import { z } from 'zod';

const createReviewSchema = z.object({
  agentId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  leadId: z.string().optional(),
});

const respondToReviewSchema = z.object({
  response: z.string().min(1),
});

export class AgentReviewController {
  /**
   * Create a review
   */
  async createReview(req: Request, res: Response) {
    try {
      const reviewData = createReviewSchema.parse(req.body);
      const userId = (req as any).user?.id; // From auth middleware

      const review = await agentReviewService.createReview({
        ...reviewData,
        userId,
      });

      res.status(201).json(review);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get agent reviews
   */
  async getAgentReviews(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      const reviews = await agentReviewService.getAgentReviews(agentId);

      res.json(reviews);
    } catch (error: any) {
      console.error('Get agent reviews error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get agent rating stats
   */
  async getAgentRatingStats(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      const stats = await agentReviewService.getAgentRatingStats(agentId);

      res.json(stats);
    } catch (error: any) {
      console.error('Get agent rating stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Agent responds to review
   */
  async respondToReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const { response } = respondToReviewSchema.parse(req.body);
      const agentId = (req as any).agent?.id; // From auth middleware

      await agentReviewService.respondToReview(reviewId, agentId, response);

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      if (error.message === 'Not authorized to respond to this review') {
        return res.status(403).json({ error: error.message });
      }
      console.error('Respond to review error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get top rated agents in suburb
   */
  async getTopRatedAgents(req: Request, res: Response) {
    try {
      const { suburb } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const agents = await agentReviewService.getTopRatedAgents(suburb, limit);

      res.json(agents);
    } catch (error: any) {
      console.error('Get top rated agents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const agentReviewController = new AgentReviewController();
