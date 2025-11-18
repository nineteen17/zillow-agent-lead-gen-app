import { PropertyRepository } from '../repositories/property.repository.js';
import { ValuationRepository } from '../repositories/valuation.repository.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';
import type { CreateProperty, UpdateProperty, PropertySearch } from '../models/zod-schemas.js';

export class PropertyService {
  private propertyRepo: PropertyRepository;
  private valuationRepo: ValuationRepository;

  constructor() {
    this.propertyRepo = new PropertyRepository();
    this.valuationRepo = new ValuationRepository();
  }

  async getPropertyById(id: string) {
    // Try cache first
    const cacheKey = `property:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info(`Property ${id} served from cache`);
      return cached;
    }

    const property = await this.propertyRepo.findById(id);
    if (!property) {
      return null;
    }

    // Cache for 1 hour
    await cache.set(cacheKey, property, 3600);
    return property;
  }

  async searchProperties(params: PropertySearch) {
    return await this.propertyRepo.search(params);
  }

  async createProperty(data: CreateProperty) {
    const property = await this.propertyRepo.create(data);
    logger.info(`Property created: ${property.id}`);
    return property;
  }

  async updateProperty(id: string, data: UpdateProperty) {
    const property = await this.propertyRepo.update(id, data);
    if (property) {
      // Invalidate cache
      await cache.del(`property:${id}`);
      logger.info(`Property updated: ${id}`);
    }
    return property;
  }

  async deleteProperty(id: string) {
    await this.propertyRepo.delete(id);
    await cache.del(`property:${id}`);
    logger.info(`Property deleted: ${id}`);
  }

  async getSuburbStats(suburb: string) {
    const cacheKey = `suburb:stats:${suburb}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const stats = await this.propertyRepo.getSuburbStats(suburb);

    // Cache for 24 hours
    await cache.set(cacheKey, stats, 86400);
    return stats;
  }

  async getPropertyValuation(propertyId: string) {
    const cacheKey = `valuation:${propertyId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const valuation = await this.valuationRepo.findByPropertyId(propertyId);

    if (valuation) {
      // Cache for 6 hours
      await cache.set(cacheKey, valuation, 21600);
    }

    return valuation;
  }
}
