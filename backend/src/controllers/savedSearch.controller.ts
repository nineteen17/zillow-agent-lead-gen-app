import { Request, Response } from 'express';
import { savedSearchService } from '../services/savedSearch.service';
import { z } from 'zod';

const createSavedSearchSchema = z.object({
  name: z.string(),
  searchCriteria: z.any(),
  emailAlerts: z.boolean().optional(),
  alertFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

const updateSavedSearchSchema = z.object({
  name: z.string().optional(),
  searchCriteria: z.any().optional(),
  emailAlerts: z.boolean().optional(),
  alertFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  isActive: z.boolean().optional(),
});

const savePropertySchema = z.object({
  propertyId: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export class SavedSearchController {
  /**
   * Create saved search
   */
  async createSavedSearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const searchData = createSavedSearchSchema.parse(req.body);

      const search = await savedSearchService.createSavedSearch({
        ...searchData,
        userId,
      });

      res.status(201).json(search);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Create saved search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const searches = await savedSearchService.getUserSavedSearches(userId);

      res.json(searches);
    } catch (error: any) {
      console.error('Get user saved searches error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { searchId } = req.params;
      const updates = updateSavedSearchSchema.parse(req.body);

      await savedSearchService.updateSavedSearch(searchId, userId, updates);

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Update saved search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { searchId } = req.params;

      await savedSearchService.deleteSavedSearch(searchId, userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete saved search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Save/favorite property
   */
  async saveProperty(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const propertyData = savePropertySchema.parse(req.body);

      const saved = await savedSearchService.saveProperty({
        ...propertyData,
        userId,
      });

      res.status(201).json(saved);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Save property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user's saved properties
   */
  async getUserSavedProperties(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const properties = await savedSearchService.getUserSavedProperties(userId);

      res.json(properties);
    } catch (error: any) {
      console.error('Get user saved properties error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove saved property
   */
  async unsaveProperty(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { propertyId } = req.params;

      await savedSearchService.unsaveProperty(userId, propertyId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Unsave property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const savedSearchController = new SavedSearchController();
