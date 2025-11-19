import { logger } from '../../config/logger.js';
import { db } from '../../config/database.js';
import { rentalStats } from '../../models/schema.js';
import { nanoid } from 'nanoid';

/**
 * MBIE (Ministry of Business, Innovation and Employment) Service  
 *
 * Data source: Tenancy Services Rental Bond Data
 * URL: https://www.tenancy.govt.nz/rent-bond-and-bills/market-rent/
 *
 * Provides:
 * - Median rents by suburb
 * - Rental trends
 * - Bond statistics
 */

interface MBIERentalStat {
  suburb: string;
  bedrooms: number;
  median_weekly_rent: number;
  sample_size: number;
  period_start: Date;
  period_end: Date;
}

export class MBIEService {
  private apiEndpoint = 'https://api.business.govt.nz/services/tenancy';

  constructor() {}

  /**
   * Fetch rental statistics from MBIE
   * Note: MBIE may not have a public API - data might need to be scraped or downloaded
   */
  async fetchRentalStats(suburb: string): Promise<MBIERentalStat[]> {
    try {
      logger.info(\`Fetching MBIE rental data for \${suburb}\`);

      // MBIE typically provides data as downloadable Excel/CSV files
      // rather than a REST API. This is a placeholder for actual implementation.

      // In production, you would either:
      // 1. Download the latest data file periodically
      // 2. Parse the Excel/CSV file
      // 3. Import into database

      logger.warn('MBIE rental data fetch not implemented. Use CSV import instead.');
      
      return [];
    } catch (error) {
      logger.error('Error fetching MBIE rental data:', error);
      return [];
    }
  }

  /**
   * Import rental statistics from MBIE CSV/Excel export
   */
  async importRentalStatsFromCSV(csvData: any[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    for (const row of csvData) {
      try {
        await db.insert(rentalStats).values({
          id: nanoid(),
          suburb: row['Suburb'] || row['suburb'],
          bedrooms: parseInt(row['Bedrooms'] || row['bedrooms']),
          weeklyRentMedian: parseInt(row['Median Rent'] || row['median_rent']),
          sampleSize: parseInt(row['Sample Size'] || row['sample_size'] || '0'),
          periodStart: new Date(row['Period Start'] || row['period_start']),
          periodEnd: new Date(row['Period End'] || row['period_end']),
        });

        imported++;
      } catch (error) {
        logger.error('Error importing rental stat:', error);
        errors++;
      }
    }

    logger.info(\`MBIE rental stats import: \${imported} imported, \${errors} errors\`);

    return { imported, errors };
  }

  /**
   * Update rental statistics for a suburb
   */
  async updateSuburbRentalStats(suburb: string) {
    const stats = await this.fetchRentalStats(suburb);

    if (stats.length === 0) {
      logger.info(\`No rental stats available for \${suburb}\`);
      return { updated: 0 };
    }

    let updated = 0;

    for (const stat of stats) {
      try {
        await db.insert(rentalStats).values({
          id: nanoid(),
          suburb: stat.suburb,
          bedrooms: stat.bedrooms,
          weeklyRentMedian: stat.median_weekly_rent,
          sampleSize: stat.sample_size,
          periodStart: stat.period_start,
          periodEnd: stat.period_end,
        });
        updated++;
      } catch (error) {
        logger.error('Error updating rental stat:', error);
      }
    }

    return { updated };
  }
}
