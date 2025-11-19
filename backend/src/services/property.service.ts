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

  async getSuburbDetailedStats(suburb: string) {
    const cacheKey = `suburb:detailed:${suburb}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info(`Suburb stats for ${suburb} served from cache`);
      return cached;
    }

    const stats = await this.propertyRepo.getSuburbDetailedStats(suburb);

    // Cache for 24 hours
    await cache.set(cacheKey, stats, 86400);
    return stats;
  }

  async getSuburbRecentSales(suburb: string, limit = 20) {
    const cacheKey = `suburb:sales:${suburb}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const sales = await this.propertyRepo.getSuburbRecentSales(suburb, limit);

    // Cache for 6 hours
    await cache.set(cacheKey, sales, 21600);
    return sales;
  }

  async getSuburbPriceTrends(suburb: string, monthsBack = 24) {
    const cacheKey = `suburb:trends:${suburb}:${monthsBack}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const trends = await this.propertyRepo.getSuburbPriceTrends(suburb, monthsBack);

    // Cache for 24 hours (trends don't change often)
    await cache.set(cacheKey, trends, 86400);
    return trends;
  }

  async getPropertiesBySuburb(suburb: string, limit = 50) {
    const cacheKey = `suburb:properties:${suburb}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const properties = await this.propertyRepo.findBySuburb(suburb, limit);

    // Cache for 1 hour
    await cache.set(cacheKey, properties, 3600);
    return properties;
  }

  async getAllSuburbs() {
    const cacheKey = 'suburbs:all';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const suburbs = await this.propertyRepo.getAllSuburbs();

    // Cache for 24 hours
    await cache.set(cacheKey, suburbs, 86400);
    return suburbs;
  }
}
