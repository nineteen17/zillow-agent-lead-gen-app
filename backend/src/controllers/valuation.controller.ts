import { Router, Request, Response, NextFunction } from 'express';
import { ValuationService } from '../services/valuation.service.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();
const valuationService = new ValuationService();

/**
 * @swagger
 * /api/valuations/{propertyId}:
 *   get:
 *     summary: Get property valuation
 *     tags: [Valuations]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property valuation
 *       404:
 *         description: Property not found
 */
router.get('/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valuation = await valuationService.getValuation(req.params.propertyId);

    if (!valuation) {
      throw new AppError(404, 'Valuation not found');
    }

    res.json(valuation);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/valuations/{propertyId}/compute:
 *   post:
 *     summary: Compute new valuation
 *     tags: [Valuations]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Computed valuation
 */
router.post('/:propertyId/compute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valuation = await valuationService.computeValuation(req.params.propertyId);
    res.json(valuation);
  } catch (error) {
    next(error);
  }
});

export default router;
