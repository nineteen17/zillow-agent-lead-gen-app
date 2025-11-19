import { Router, Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();
const propertyService = new PropertyService();

/**
 * @swagger
 * /api/suburbs:
 *   get:
 *     summary: Get all suburbs
 *     tags: [Suburbs]
 *     responses:
 *       200:
 *         description: List of all suburbs
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburbs = await propertyService.getAllSuburbs();
    res.json({ suburbs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/suburbs/{suburb}/stats:
 *   get:
 *     summary: Get detailed statistics for a suburb
 *     tags: [Suburbs]
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suburb statistics including property counts, sales data, and trends
 *       404:
 *         description: Suburb not found
 */
router.get('/:suburb/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = decodeURIComponent(req.params.suburb);
    const stats = await propertyService.getSuburbDetailedStats(suburb);

    if (!stats.propertyStats || stats.propertyStats.totalProperties === 0) {
      throw new AppError(404, 'Suburb not found or has no properties');
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/suburbs/{suburb}/sales:
 *   get:
 *     summary: Get recent sales in a suburb
 *     tags: [Suburbs]
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent sales data
 */
router.get('/:suburb/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = decodeURIComponent(req.params.suburb);
    const limit = parseInt(req.query.limit as string) || 20;
    const sales = await propertyService.getSuburbRecentSales(suburb, limit);

    res.json({ sales });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/suburbs/{suburb}/trends:
 *   get:
 *     summary: Get price trends for a suburb
 *     tags: [Suburbs]
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: monthsBack
 *         schema:
 *           type: integer
 *           default: 24
 *     responses:
 *       200:
 *         description: Monthly price trends
 */
router.get('/:suburb/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = decodeURIComponent(req.params.suburb);
    const monthsBack = parseInt(req.query.monthsBack as string) || 24;
    const trends = await propertyService.getSuburbPriceTrends(suburb, monthsBack);

    res.json({ trends });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/suburbs/{suburb}/properties:
 *   get:
 *     summary: Get properties in a suburb
 *     tags: [Suburbs]
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/:suburb/properties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = decodeURIComponent(req.params.suburb);
    const limit = parseInt(req.query.limit as string) || 50;
    const properties = await propertyService.getPropertiesBySuburb(suburb, limit);

    res.json({ properties });
  } catch (error) {
    next(error);
  }
});

export default router;
