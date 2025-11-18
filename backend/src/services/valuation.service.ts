import { ValuationRepository } from '../repositories/valuation.repository.js';
import { PropertyRepository } from '../repositories/property.repository.js';
import { logger } from '../config/logger.js';

/**
 * Valuation Service
 *
 * For MVP, we use a simple formula-based valuation:
 * - Base: CV (Capital Value) from council
 * - Adjust for suburb median
 * - Adjust for property characteristics
 *
 * In production, this would call a separate ML model service
 */
export class ValuationService {
  private valuationRepo: ValuationRepository;
  private propertyRepo: PropertyRepository;

  constructor() {
    this.valuationRepo = new ValuationRepository();
    this.propertyRepo = new PropertyRepository();
  }

  /**
   * Get or compute valuation for a property
   */
  async getValuation(propertyId: string) {
    // Check if we have a recent valuation (< 30 days old)
    const existing = await this.valuationRepo.findByPropertyId(propertyId);

    if (existing) {
      const age = Date.now() - existing.estimateDate.getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      if (age < thirtyDays) {
        return existing;
      }
    }

    // Compute new valuation
    return await this.computeValuation(propertyId);
  }

  /**
   * Compute a new valuation for a property
   */
  async computeValuation(propertyId: string) {
    const property = await this.propertyRepo.findById(propertyId);

    if (!property) {
      throw new Error('Property not found');
    }

    // Simple formula-based valuation for MVP
    let estimateValue = property.cvValue || 0;

    if (estimateValue === 0) {
      // If no CV, use average for suburb
      const suburbStats = await this.propertyRepo.getSuburbStats(property.suburb);
      estimateValue = Number(suburbStats?.avgCvValue || 500000); // Default fallback
    }

    // Apply adjustments
    const adjustmentFactor = this.calculateAdjustmentFactor(property);
    estimateValue = Math.round(estimateValue * adjustmentFactor);

    // Calculate confidence band (±10% for simple model)
    const confidenceBandLow = Math.round(estimateValue * 0.9);
    const confidenceBandHigh = Math.round(estimateValue * 1.1);

    // Save valuation
    const valuation = await this.valuationRepo.create({
      propertyId,
      estimateValue,
      modelVersion: 'formula-v1',
      confidenceBandLow,
      confidenceBandHigh,
      features: {
        baseValue: property.cvValue,
        adjustmentFactor,
        suburb: property.suburb,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        floorAreaSqm: property.floorAreaSqm,
        yearBuilt: property.yearBuilt,
      },
    });

    logger.info(`Valuation computed for property ${propertyId}: $${estimateValue}`);

    return valuation;
  }

  /**
   * Calculate adjustment factor based on property characteristics
   * This is a simplified model for MVP
   */
  private calculateAdjustmentFactor(property: any): number {
    let factor = 1.0;

    // Age adjustment
    if (property.yearBuilt) {
      const age = new Date().getFullYear() - property.yearBuilt;
      if (age < 5) {
        factor += 0.05; // 5% premium for new properties
      } else if (age > 50) {
        factor -= 0.1; // 10% discount for old properties
      }
    }

    // Size adjustment
    if (property.floorAreaSqm) {
      if (property.floorAreaSqm > 200) {
        factor += 0.05; // 5% premium for large properties
      } else if (property.floorAreaSqm < 80) {
        factor -= 0.05; // 5% discount for small properties
      }
    }

    // Property type adjustment
    if (property.propertyType === 'house') {
      factor += 0.02; // 2% premium for houses
    } else if (property.propertyType === 'apartment') {
      factor -= 0.02; // 2% discount for apartments
    }

    return factor;
  }

  /**
   * Batch recompute valuations (for background jobs)
   */
  async recomputeValuationsForSuburb(suburb: string) {
    const properties = await this.propertyRepo.findBySuburb(suburb);

    logger.info(`Recomputing valuations for ${properties.length} properties in ${suburb}`);

    const results = [];
    for (const property of properties) {
      try {
        const valuation = await this.computeValuation(property.id);
        results.push(valuation);
      } catch (error) {
        logger.error(`Failed to compute valuation for property ${property.id}:`, error);
      }
    }

    logger.info(`Completed valuation recomputation for ${suburb}: ${results.length} successful`);
    return results;
  }
}
