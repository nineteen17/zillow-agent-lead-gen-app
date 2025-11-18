import { Router, Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service.js';
import { db } from '../config/database.js';
import { sales, rentalStats } from '../models/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { cache } from '../config/redis.js';

const router = Router();
const propertyService = new PropertyService();

/**
 * @swagger
 * /api/suburbs/{suburb}/stats:
 *   get:
 *     summary: Get suburb statistics
 *     tags: [Suburbs]
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suburb statistics
 */
router.get('/:suburb/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = req.params.suburb;
    const cacheKey = `suburb:full-stats:${suburb}`;

    // Try cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Get property stats
    const propertyStats = await propertyService.getSuburbStats(suburb);

    // Get sales stats - We'll implement this properly later with a repository method
    const salesStats = {
      totalSales: 0,
      medianPrice: null,
      avgPrice: null,
    };

    // Get rental stats
    const latestRentals = await db.query.rentalStats.findFirst({
      where: eq(rentalStats.suburb, suburb),
      orderBy: desc(rentalStats.periodEnd),
    });

    const stats = {
      suburb,
      propertyStats,
      salesStats: {
        totalSales: 0,
        medianPrice: null,
        avgPrice: null,
      },
      rentalStats: latestRentals || null,
    };

    // Cache for 24 hours
    await cache.set(cacheKey, stats, 86400);

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
