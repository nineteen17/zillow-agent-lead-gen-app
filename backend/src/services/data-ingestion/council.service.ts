import { logger } from '../../config/logger.js';
import { PropertyRepository } from '../../repositories/property.repository.js';
import { db } from '../../config/database.js';
import { sales } from '../../models/schema.js';
import { nanoid } from 'nanoid';

/**
 * Council Data Service
 *
 * Handles data ingestion from NZ councils:
 * - Auckland Council (https://www.aucklandcouncil.govt.nz/)
 * - Wellington City Council
 * - Christchurch City Council
 *
 * Data sources:
 * 1. Council Rating Information (CV/RV values)
 * 2. Recent sales data (public records)
 * 3. Property characteristics
 */

interface CouncilProperty {
  address: string;
  suburb: string;
  cv_value?: number;
  rv_value?: number;
  land_area_sqm?: number;
  floor_area_sqm?: number;
  year_built?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export class CouncilService {
  private propertyRepo: PropertyRepository;
  private councilApiKeys: Map<string, string>;

  constructor() {
    this.propertyRepo = new PropertyRepository();
    this.councilApiKeys = new Map();

    if (process.env.COUNCIL_API_KEYS) {
      const pairs = process.env.COUNCIL_API_KEYS.split(',');
      pairs.forEach(pair => {
        const [council, key] = pair.split(':');
        if (council && key) {
          this.councilApiKeys.set(council.toLowerCase(), key);
        }
      });
    }
  }

  async fetchAucklandRatingData(suburb: string): Promise<CouncilProperty[]> {
    const apiKey = this.councilApiKeys.get('auckland');
    if (!apiKey) {
      logger.warn('Auckland Council API key not configured');
      return [];
    }

    try {
      logger.info(\`Fetching Auckland Council data for \${suburb}\`);
      // Implementation would call Auckland Council API
      // Placeholder for now
      return [];
    } catch (error) {
      logger.error('Error fetching Auckland Council data:', error);
      return [];
    }
  }

  async importFromCSV(csvData: any[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    for (const row of csvData) {
      try {
        const propertyData = {
          addressLine1: row['Address'] || row['address'],
          suburb: row['Suburb'] || row['suburb'],
          city: row['City'] || row['city'],
          cvValue: parseInt(row['CV'] || '0'),
          rvValue: parseInt(row['RV'] || '0'),
          landAreaSqm: parseInt(row['Land Area'] || '0') || undefined,
          floorAreaSqm: parseInt(row['Floor Area'] || '0') || undefined,
          yearBuilt: parseInt(row['Year Built'] || '0') || undefined,
          sourceFlags: JSON.stringify(['Council', 'CSV']),
        };

        await this.propertyRepo.create(propertyData);
        imported++;
      } catch (error) {
        logger.error('Error importing CSV row:', error);
        errors++;
      }
    }

    return { imported, errors };
  }

  async importSalesFromCSV(csvData: any[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    for (const row of csvData) {
      try {
        const address = row['Address'] || row['address'];
        const properties = await this.propertyRepo.search({ query: address, limit: 1 });

        if (properties.properties.length === 0) {
          logger.warn(\`Property not found for address: \${address}\`);
          errors++;
          continue;
        }

        await db.insert(sales).values({
          id: nanoid(),
          propertyId: properties.properties[0].id,
          saleDate: new Date(row['Sale Date'] || row['sale_date']),
          salePrice: parseInt(row['Sale Price'] || row['sale_price']),
          source: 'Council',
          isInferred: false,
          confidenceScore: '0.95',
        });

        imported++;
      } catch (error) {
        logger.error('Error importing sale:', error);
        errors++;
      }
    }

    return { imported, errors };
  }
}
