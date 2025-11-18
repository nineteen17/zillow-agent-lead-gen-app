import { Router, Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service.js';
import { ValuationService } from '../services/valuation.service.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import { propertySearchSchema } from '../models/zod-schemas.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();
const propertyService = new PropertyService();
const valuationService = new ValuationService();

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: suburb
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/search',
  validateQuery(propertySearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await propertyService.searchProperties(req.query as any);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    res.json(property);
  } catch (error) {
    next(error);
  }
});

export default router;
