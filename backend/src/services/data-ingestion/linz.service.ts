import { env } from '../../config/logger.js';
import { logger } from '../../config/logger.js';
import { PropertyRepository } from '../../repositories/property.repository.js';

/**
 * LINZ (Land Information New Zealand) API Service
 *
 * Official API: https://data.linz.govt.nz/
 * Documentation: https://data.linz.govt.nz/docs/
 *
 * Key datasets:
 * - NZ Street Address (Electoral)
 * - NZ Property Titles
 * - NZ Parcel Boundaries
 */

interface LINZAddress {
  address_id: string;
  full_address: string;
  address_number: string;
  road_name: string;
  suburb_locality: string;
  town_city: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

export class LINZService {
  private apiKey: string | undefined;
  private baseUrl = 'https://data.linz.govt.nz/services';
  private propertyRepo: PropertyRepository;

  constructor() {
    this.apiKey = process.env.LINZ_API_KEY;
    this.propertyRepo = new PropertyRepository();
  }

  /**
   * Fetch addresses from LINZ API by suburb
   */
  async fetchAddressesBySuburb(suburb: string): Promise<LINZAddress[]> {
    if (!this.apiKey) {
      logger.warn('LINZ API key not configured. Skipping LINZ data fetch.');
      return [];
    }

    try {
      logger.info(`Fetching LINZ addresses for suburb: ${suburb}`);

      // LINZ uses OGC WFS (Web Feature Service) protocol
      // Example endpoint: /services/query/v1/vector.json/layer-{layer-id}/wfs
      // Filter by suburb using CQL filter

      const params = new URLSearchParams({
        key: this.apiKey,
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: 'layer-105689', // NZ Street Address layer ID (example)
        outputFormat: 'application/json',
        cql_filter: `suburb_locality='${suburb}'`,
        maxFeatures: '1000',
      });

      const url = `${this.baseUrl}/query/v1/vector.json/wfs?${params}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`LINZ API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform LINZ response to our format
      const addresses: LINZAddress[] = data.features?.map((feature: any) => ({
        address_id: feature.properties.address_id,
        full_address: feature.properties.full_address,
        address_number: feature.properties.address_number,
        road_name: feature.properties.road_name,
        suburb_locality: feature.properties.suburb_locality,
        town_city: feature.properties.town_city,
        postcode: feature.properties.postcode,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      })) || [];

      logger.info(`Fetched ${addresses.length} addresses from LINZ for ${suburb}`);

      return addresses;
    } catch (error) {
      logger.error(`Error fetching LINZ data for ${suburb}:`, error);
      return [];
    }
  }

  /**
   * Import LINZ addresses into properties table
   */
  async importAddressesToProperties(suburb: string) {
    const addresses = await this.fetchAddressesBySuburb(suburb);

    if (addresses.length === 0) {
      logger.info(`No addresses to import for ${suburb}`);
      return { imported: 0, errors: 0 };
    }

    let imported = 0;
    let errors = 0;

    for (const address of addresses) {
      try {
        await this.propertyRepo.create({
          linzAddressId: address.address_id,
          addressLine1: `${address.address_number} ${address.road_name}`.trim(),
          suburb: address.suburb_locality,
          city: address.town_city,
          postcode: address.postcode,
          lat: address.latitude.toString(),
          lng: address.longitude.toString(),
          sourceFlags: JSON.stringify(['LINZ']),
        });
        imported++;
      } catch (error) {
        logger.error(`Error importing address ${address.address_id}:`, error);
        errors++;
      }
    }

    logger.info(`LINZ import complete for ${suburb}: ${imported} imported, ${errors} errors`);

    return { imported, errors, total: addresses.length };
  }

  /**
   * Fetch all addresses (paginated)
   * Use with caution - NZ has millions of addresses
   */
  async fetchAllAddresses(limit = 1000, offset = 0): Promise<LINZAddress[]> {
    if (!this.apiKey) {
      logger.warn('LINZ API key not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: 'layer-105689',
        outputFormat: 'application/json',
        maxFeatures: limit.toString(),
        startIndex: offset.toString(),
      });

      const url = `${this.baseUrl}/query/v1/vector.json/wfs?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`LINZ API error: ${response.status}`);
      }

      const data = await response.json();

      return data.features?.map((feature: any) => ({
        address_id: feature.properties.address_id,
        full_address: feature.properties.full_address,
        address_number: feature.properties.address_number,
        road_name: feature.properties.road_name,
        suburb_locality: feature.properties.suburb_locality,
        town_city: feature.properties.town_city,
        postcode: feature.properties.postcode,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      })) || [];
    } catch (error) {
      logger.error('Error fetching all LINZ addresses:', error);
      return [];
    }
  }
}
