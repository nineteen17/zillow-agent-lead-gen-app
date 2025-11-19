import { db } from '../config/database';
import { savedSearches, savedProperties, properties } from '../models/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class SavedSearchService {
  /**
   * Create a new saved search
   */
  async createSavedSearch(params: {
    userId: string;
    name: string;
    searchCriteria: any;
    emailAlerts?: boolean;
    alertFrequency?: 'daily' | 'weekly' | 'monthly';
  }) {
    const search = await db.insert(savedSearches).values({
      id: crypto.randomUUID(),
      userId: params.userId,
      name: params.name,
      searchCriteria: params.searchCriteria,
      emailAlerts: params.emailAlerts ?? true,
      alertFrequency: params.alertFrequency || 'daily',
    }).returning();

    return search[0];
  }

  /**
   * Get all saved searches for a user
   */
  async getUserSavedSearches(userId: string) {
    return await db.query.savedSearches.findMany({
      where: eq(savedSearches.userId, userId),
      orderBy: [desc(savedSearches.createdAt)],
    });
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    searchId: string,
    userId: string,
    updates: {
      name?: string;
      searchCriteria?: any;
      emailAlerts?: boolean;
      alertFrequency?: 'daily' | 'weekly' | 'monthly';
      isActive?: boolean;
    }
  ) {
    const search = await db.query.savedSearches.findFirst({
      where: and(
        eq(savedSearches.id, searchId),
        eq(savedSearches.userId, userId)
      ),
    });

    if (!search) {
      throw new Error('Saved search not found');
    }

    await db.update(savedSearches)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(savedSearches.id, searchId));
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string, userId: string) {
    await db.delete(savedSearches)
      .where(
        and(
          eq(savedSearches.id, searchId),
          eq(savedSearches.userId, userId)
        )
      );
  }

  /**
   * Save/favorite a property
   */
  async saveProperty(params: {
    userId: string;
    propertyId: string;
    notes?: string;
    tags?: string[];
  }) {
    const saved = await db.insert(savedProperties).values({
      id: crypto.randomUUID(),
      userId: params.userId,
      propertyId: params.propertyId,
      notes: params.notes,
      tags: params.tags,
    }).returning();

    return saved[0];
  }

  /**
   * Get all saved properties for a user
   */
  async getUserSavedProperties(userId: string) {
    return await db.query.savedProperties.findMany({
      where: eq(savedProperties.userId, userId),
      with: {
        property: true,
      },
      orderBy: [desc(savedProperties.createdAt)],
    });
  }

  /**
   * Check if property is saved by user
   */
  async isPropertySaved(userId: string, propertyId: string): Promise<boolean> {
    const saved = await db.query.savedProperties.findFirst({
      where: and(
        eq(savedProperties.userId, userId),
        eq(savedProperties.propertyId, propertyId)
      ),
    });

    return !!saved;
  }

  /**
   * Remove saved property
   */
  async unsaveProperty(userId: string, propertyId: string) {
    await db.delete(savedProperties)
      .where(
        and(
          eq(savedProperties.userId, userId),
          eq(savedProperties.propertyId, propertyId)
        )
      );
  }

  /**
   * Update saved property notes/tags
   */
  async updateSavedProperty(
    userId: string,
    propertyId: string,
    updates: { notes?: string; tags?: string[] }
  ) {
    await db.update(savedProperties)
      .set(updates)
      .where(
        and(
          eq(savedProperties.userId, userId),
          eq(savedProperties.propertyId, propertyId)
        )
      );
  }
}

export const savedSearchService = new SavedSearchService();
