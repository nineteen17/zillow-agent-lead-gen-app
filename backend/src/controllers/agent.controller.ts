import { Router, Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agent.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { updateLeadStatusSchema } from '../models/zod-schemas.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();
const agentService = new AgentService();

// All agent routes require authentication and agent role
router.use(requireAuth);
router.use(requireRole('agent', 'admin'));

/**
 * @swagger
 * /api/agent/me:
 *   get:
 *     summary: Get current agent profile
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentService.getAgentByUserId(req.user!.id);

    if (!agent) {
      throw new AppError(404, 'Agent profile not found');
    }

    res.json(agent);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/agent/leads:
 *   get:
 *     summary: Get agent's leads
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/leads', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentService.getAgentByUserId(req.user!.id);

    if (!agent) {
      throw new AppError(404, 'Agent profile not found');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const leads = await agentService.getAgentLeads(agent.id, page, limit);

    res.json({
      leads,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/agent/leads/{id}:
 *   patch:
 *     summary: Update lead status
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, delivered, contacted, qualified, closed_won, closed_lost]
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.patch(
  '/leads/:id',
  validateBody(updateLeadStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agent = await agentService.getAgentByUserId(req.user!.id);

      if (!agent) {
        throw new AppError(404, 'Agent profile not found');
      }

      const lead = await agentService.updateLeadStatus(
        req.params.id,
        agent.id,
        req.body.status
      );

      res.json(lead);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/agent/subscriptions:
 *   get:
 *     summary: Get agent's subscriptions
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get('/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentService.getAgentByUserId(req.user!.id);

    if (!agent) {
      throw new AppError(404, 'Agent profile not found');
    }

    const subscriptions = await agentService.getAgentSubscriptions(agent.id);

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/agent/metrics:
 *   get:
 *     summary: Get agent's performance metrics
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Period in YYYY-MM format
 *     responses:
 *       200:
 *         description: Agent metrics
 */
router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentService.getAgentByUserId(req.user!.id);

    if (!agent) {
      throw new AppError(404, 'Agent profile not found');
    }

    const period = req.query.period as string | undefined;
    const metrics = await agentService.getAgentMetrics(agent.id, period);

    res.json(metrics || { message: 'No metrics available for this period' });
  } catch (error) {
    next(error);
  }
});

export default router;
