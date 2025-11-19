import { ValuationRepository } from '../repositories/valuation.repository.js';
import { PropertyRepository } from '../repositories/property.repository.js';
import { logger } from '../config/logger.js';

/**
 * Heuristic Valuation Engine (No ML Required)
 *
 * Algorithm:
 * 1. Get CV (Council Valuation) as baseline
 * 2. Calculate suburb calibration ratio (SuburbMedianSale / SuburbMedianCV)
 * 3. Apply suburb ratio: BaseEstimate = CV × SuburbRatio
 * 4. Add consistent variation (seeded by property ID): FinalEstimate = BaseEstimate × (1 + adjustment)
 * 5. Store and cache result (do NOT regenerate on each visit)
 *
 * Why this works:
 * - CV is trusted baseline, NZ properties typically sell within ±15% of CV
 * - Suburb calibration adds local market trends
 * - Seeded randomness ensures consistency across visits
 * - Fast, explainable, perfect for lead generation
 */
export class ValuationService {
  private valuationRepo: ValuationRepository;
  private propertyRepo: PropertyRepository;

  constructor() {
    this.valuationRepo = new ValuationRepository();
    this.propertyRepo = new PropertyRepository();
  }

  /**
   * Seeded random number generator for consistent results
   * Same property ID always produces same "random" adjustment
   */
  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const normalized = Math.abs(Math.sin(hash));
    return normalized;
  }

  /**
   * Get random adjustment between min and max using seeded random
   */
  private getSeededAdjustment(propertyId: string, min: number, max: number): number {
    const random = this.seededRandom(propertyId);
    return min + (random * (max - min));
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
   * Compute a new valuation for a property using heuristic engine
   */
  async computeValuation(propertyId: string) {
    const property = await this.propertyRepo.findById(propertyId);

    if (!property) {
      throw new Error('Property not found');
    }

    // STEP 1: Get CV (Council Valuation)
    let cv = property.cvValue || 0;

    if (cv === 0) {
      // Fallback: use suburb average CV if property CV is missing
      const suburbStats = await this.propertyRepo.getSuburbStats(property.suburb);
      cv = Number(suburbStats?.avgCvValue || 500000);
      logger.warn(`Property ${propertyId} has no CV, using suburb average: $${cv}`);
    }

    // STEP 2: Calculate suburb calibration ratio (optional but recommended)
    let suburbRatio = 1.0;
    const suburbStats = await this.propertyRepo.getSuburbStats(property.suburb);

    if (suburbStats?.avgSalePrice && suburbStats?.avgCvValue) {
      // SuburbRatio = SuburbMedianSale / SuburbMedianCV
      suburbRatio = Number(suburbStats.avgSalePrice) / Number(suburbStats.avgCvValue);

      // Cap suburb ratio to reasonable bounds (0.8 to 1.3)
      suburbRatio = Math.max(0.8, Math.min(1.3, suburbRatio));
    }

    // STEP 3: Calculate base estimate with suburb calibration
    let baseEstimate = cv * suburbRatio;

    // STEP 4: Add consistent variation (seeded by property ID)
    // Range: -5% to +15% (after suburb calibration)
    const adjustment = this.getSeededAdjustment(propertyId, -0.05, 0.15);
    const finalEstimate = Math.round(baseEstimate * (1 + adjustment));

    // STEP 5: Calculate confidence bands (±10%)
    const confidenceBandLow = Math.round(finalEstimate * 0.9);
    const confidenceBandHigh = Math.round(finalEstimate * 1.1);

    // STEP 6: Save valuation (cached for consistency)
    const valuation = await this.valuationRepo.create({
      propertyId,
      estimateValue: finalEstimate,
      modelVersion: 'heuristic-v1',
      confidenceBandLow,
      confidenceBandHigh,
      features: {
        cv: cv,
        suburbRatio: parseFloat(suburbRatio.toFixed(3)),
        adjustment: parseFloat(adjustment.toFixed(3)),
        baseEstimate: Math.round(baseEstimate),
        suburb: property.suburb,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
      },
    });

    logger.info(`Heuristic valuation computed for property ${propertyId}:`, {
      cv,
      suburbRatio: suburbRatio.toFixed(3),
      adjustment: (adjustment * 100).toFixed(1) + '%',
      finalEstimate,
    });

    return valuation;
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
