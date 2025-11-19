import { Router, Request, Response, NextFunction } from 'express';
import { PropertyRepository } from '../repositories/property.repository.js';
import { ValuationService } from '../services/valuation.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createPropertySchema, createSaleSchema } from '../models/zod-schemas.js';
import { db } from '../config/database.js';
import { sales } from '../models/schema.js';
import { nanoid } from 'nanoid';
import { logger } from '../config/logger.js';

const router = Router();
const propertyRepo = new PropertyRepository();
const valuationService = new ValuationService();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/admin/ingest/properties:
 *   post:
 *     summary: Ingest property data (bulk)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               properties:
 *                 type: array
 *     responses:
 *       200:
 *         description: Properties ingested
 */
router.post('/ingest/properties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { properties } = req.body;

    if (!Array.isArray(properties)) {
      return res.status(400).json({ error: 'Properties must be an array' });
    }

    const results = [];
    for (const propertyData of properties) {
      try {
        const property = await propertyRepo.create(propertyData);
        results.push({ success: true, id: property.id });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message });
      }
    }

    logger.info(`Bulk property ingestion: ${results.filter(r => r.success).length}/${results.length} successful`);

    res.json({
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/ingest/sales:
 *   post:
 *     summary: Ingest sales data (bulk)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales ingested
 */
router.post('/ingest/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sales: salesData } = req.body;

    if (!Array.isArray(salesData)) {
      return res.status(400).json({ error: 'Sales must be an array' });
    }

    const results = [];
    for (const saleData of salesData) {
      try {
        const [sale] = await db
          .insert(sales)
          .values({
            id: nanoid(),
            ...saleData,
          })
          .returning();
        results.push({ success: true, id: sale.id });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message });
      }
    }

    logger.info(`Bulk sales ingestion: ${results.filter(r => r.success).length}/${results.length} successful`);

    res.json({
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/ingest/rentals:
 *   post:
 *     summary: Ingest rental data (bulk)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rentals ingested
 */
router.post('/ingest/rentals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder for rental data ingestion
    res.json({ message: 'Rental data ingestion not yet implemented' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/retrain-avm:
 *   post:
 *     summary: Trigger AVM model retraining
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retraining triggered
 */
router.post('/retrain-avm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('AVM retraining triggered by admin');

    // Placeholder - in production, this would trigger a background job
    res.json({
      message: 'AVM retraining job queued',
      status: 'pending',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/valuations/recompute/{suburb}:
 *   post:
 *     summary: Recompute valuations for a suburb
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: suburb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Valuations recomputed
 */
router.post('/valuations/recompute/:suburb', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = req.params.suburb;
    const results = await valuationService.recomputeValuationsForSuburb(suburb);

    res.json({
      suburb,
      valuationsComputed: results.length,
      message: `Recomputed ${results.length} valuations for ${suburb}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/properties/{id}/override:
 *   patch:
 *     summary: Override property data manually
 *     tags: [Admin]
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
 *             properties:
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               floorAreaSqm:
 *                 type: integer
 *               yearBuilt:
 *                 type: integer
 *               cvValue:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated
 *       404:
 *         description: Property not found
 */
router.patch('/properties/:id/override', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if property exists
    const property = await propertyRepo.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Update property with override data
    const updated = await propertyRepo.update(id, updateData);

    logger.info(`Admin override applied to property ${id}`, {
      admin: req.user?.email,
      updates: Object.keys(updateData),
    });

    res.json({
      success: true,
      property: updated,
      message: 'Property data overridden successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
