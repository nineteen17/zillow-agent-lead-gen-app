import { Router, Request, Response, NextFunction } from 'express';
import { LeadRoutingService } from '../services/lead-routing.service.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createLeadSchema } from '../models/zod-schemas.js';

const router = Router();
const leadRoutingService = new LeadRoutingService();

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leadType
 *               - suburb
 *               - name
 *               - email
 *             properties:
 *               leadType:
 *                 type: string
 *                 enum: [buyer, seller, mortgage, rental]
 *               suburb:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               propertyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created and routed
 */
router.post(
  '/',
  validateBody(createLeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadRoutingService.routeLead(req.body);

      res.status(201).json({
        lead: result.lead,
        assignedAgent: result.assignedAgent,
        message: result.assignedAgent
          ? 'Lead created and assigned to agent'
          : 'Lead created but no agents available in this suburb',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
