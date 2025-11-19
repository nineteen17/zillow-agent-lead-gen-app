import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  /**
   * Get agent performance analytics
   */
  async getAgentPerformance(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const period = (req.query.period as 'week' | 'month' | 'quarter' | 'year') || 'month';

      const analytics = await analyticsService.getAgentPerformanceAnalytics(agentId, period);

      res.json(analytics);
    } catch (error: any) {
      console.error('Get agent performance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get lead conversion funnel
   */
  async getLeadConversionFunnel(req: Request, res: Response) {
    try {
      const agentId = (req as any).agent?.id;
      if (!agentId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const funnel = await analyticsService.getLeadConversionFunnel({
        agentId,
        startDate,
        endDate,
      });

      res.json(funnel);
    } catch (error: any) {
      console.error('Get lead conversion funnel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get revenue analytics (admin only)
   */
  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Last year
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const analytics = await analyticsService.getRevenueAnalytics({
        startDate,
        endDate,
      });

      res.json(analytics);
    } catch (error: any) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get lead volume trends
   */
  async getLeadVolumeTrends(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Last 90 days
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

      const trends = await analyticsService.getLeadVolumeTrends({
        startDate,
        endDate,
        groupBy,
      });

      res.json(trends);
    } catch (error: any) {
      console.error('Get lead volume trends error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get top performing agents
   */
  async getTopPerformingAgents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topAgents = await analyticsService.getTopPerformingAgents(limit);

      res.json(topAgents);
    } catch (error: any) {
      console.error('Get top performing agents error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const analyticsController = new AnalyticsController();
