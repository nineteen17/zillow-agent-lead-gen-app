import { Request, Response } from 'express';
import { abTestService } from '../services/abtest.service';
import { z } from 'zod';

const createExperimentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  variants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      weight: z.number().min(0).max(100),
      config: z.any(),
    })
  ),
});

const trackEventSchema = z.object({
  experimentId: z.string(),
  eventType: z.string(),
  metadata: z.any().optional(),
});

export class ABTestController {
  /**
   * Create experiment (admin only)
   */
  async createExperiment(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const experimentData = createExperimentSchema.parse(req.body);

      const experiment = await abTestService.createExperiment(experimentData);

      res.status(201).json(experiment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Create experiment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Start experiment (admin only)
   */
  async startExperiment(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const { experimentId } = req.params;

      await abTestService.startExperiment(experimentId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Start experiment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Stop experiment (admin only)
   */
  async stopExperiment(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const { experimentId } = req.params;

      await abTestService.stopExperiment(experimentId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Stop experiment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get variant for user
   */
  async getVariant(req: Request, res: Response) {
    try {
      const { experimentId } = req.params;
      const userId = (req as any).user?.id;
      const sessionId = req.sessionID;

      const variantId = await abTestService.getVariant(experimentId, userId, sessionId);

      res.json({ variantId });
    } catch (error: any) {
      console.error('Get variant error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Track event
   */
  async trackEvent(req: Request, res: Response) {
    try {
      const eventData = trackEventSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const sessionId = req.sessionID;

      await abTestService.trackEvent({
        ...eventData,
        userId,
        sessionId,
      });

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Track event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get experiment results (admin only)
   */
  async getExperimentResults(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
      }

      const { experimentId } = req.params;

      const results = await abTestService.getExperimentResults(experimentId);

      res.json(results);
    } catch (error: any) {
      console.error('Get experiment results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const abTestController = new ABTestController();
