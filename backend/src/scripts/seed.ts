import { db } from '../config/database.js';
import {
  properties,
  agents,
  agentSubscriptions,
  sales,
  rentalStats,
  valuations,
} from '../models/schema.js';
import { logger } from '../config/logger.js';

/**
 * Seed database with sample data for development
 */
async function seed() {
  try {
    logger.info('Starting database seed...');

    // 1. Create sample agents
    logger.info('Creating agents...');
    const agentIds = await db
      .insert(agents)
      .values([
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+64 21 123 4567',
          agencyName: 'Premium Realty NZ',
          licenseNumber: 'REA2023001',
          regions: JSON.stringify(['Auckland', 'North Shore']),
          profileBio: 'Experienced agent with 10+ years in Auckland property market',
          photoUrl: 'https://i.pravatar.cc/300?img=1',
          role: 'agent',
        },
        {
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          phone: '+64 21 234 5678',
          agencyName: 'Elite Properties',
          licenseNumber: 'REA2023002',
          regions: JSON.stringify(['Wellington', 'Lower Hutt']),
          profileBio: 'Specialist in Wellington residential and commercial properties',
          photoUrl: 'https://i.pravatar.cc/300?img=12',
          role: 'agent',
        },
        {
          name: 'Emma Williams',
          email: 'emma.williams@example.com',
          phone: '+64 21 345 6789',
          agencyName: 'Bay Realty',
          licenseNumber: 'REA2023003',
          regions: JSON.stringify(['Christchurch', 'Riccarton']),
          profileBio: 'Your trusted advisor for Christchurch property investments',
          photoUrl: 'https://i.pravatar.cc/300?img=5',
          role: 'agent',
        },
      ])
      .returning({ id: agents.id });

    logger.info(`Created ${agentIds.length} agents`);

    // 2. Create agent subscriptions
    logger.info('Creating agent subscriptions...');
    await db.insert(agentSubscriptions).values([
      {
        agentId: agentIds[0].id,
        suburb: 'Albany',
        tier: 'premium',
        monthlyPrice: 299,
        leadCapPerMonth: 30,
        activeFrom: new Date('2025-01-01'),
        activeTo: new Date('2025-12-31'),
      },
      {
        agentId: agentIds[0].id,
        suburb: 'Browns Bay',
        tier: 'basic',
        monthlyPrice: 99,
        leadCapPerMonth: 10,
        activeFrom: new Date('2025-01-01'),
        activeTo: new Date('2025-12-31'),
      },
      {
        agentId: agentIds[1].id,
        suburb: 'Lower Hutt',
        tier: 'seller',
        monthlyPrice: 499,
        leadCapPerMonth: 50,
        activeFrom: new Date('2025-01-01'),
        activeTo: new Date('2025-12-31'),
      },
      {
        agentId: agentIds[2].id,
        suburb: 'Riccarton',
        tier: 'premium',
        monthlyPrice: 299,
        leadCapPerMonth: 30,
        activeFrom: new Date('2025-01-01'),
        activeTo: new Date('2025-12-31'),
      },
    ]);

    logger.info('Created agent subscriptions');

    // 3. Create sample properties
    logger.info('Creating properties...');
    const propertyIds = await db
      .insert(properties)
      .values([
        {
          linzAddressId: 'LINZ001',
          addressLine1: '123 Beach Road',
          suburb: 'Albany',
          city: 'Auckland',
          postcode: '0632',
          lat: -36.7283,
          lng: 174.7016,
          cvValue: 1250000,
          rvValue: 1200000,
          landAreaSqm: 450,
          floorAreaSqm: 180,
          yearBuilt: 2015,
          propertyType: 'house',
          bedrooms: 4,
          bathrooms: 2,
          sourceFlags: JSON.stringify(['LINZ', 'Council']),
        },
        {
          linzAddressId: 'LINZ002',
          addressLine1: '45 Ocean View Drive',
          suburb: 'Browns Bay',
          city: 'Auckland',
          postcode: '0630',
          lat: -36.7129,
          lng: 174.7531,
          cvValue: 1850000,
          rvValue: 1800000,
          landAreaSqm: 650,
          floorAreaSqm: 250,
          yearBuilt: 2010,
          propertyType: 'house',
          bedrooms: 5,
          bathrooms: 3,
          sourceFlags: JSON.stringify(['LINZ', 'Council']),
        },
        {
          linzAddressId: 'LINZ003',
          addressLine1: '78 Main Street',
          suburb: 'Lower Hutt',
          city: 'Wellington',
          postcode: '5010',
          lat: -41.2091,
          lng: 174.9090,
          cvValue: 750000,
          rvValue: 720000,
          landAreaSqm: 320,
          floorAreaSqm: 120,
          yearBuilt: 1998,
          propertyType: 'townhouse',
          bedrooms: 3,
          bathrooms: 2,
          sourceFlags: JSON.stringify(['LINZ', 'Council']),
        },
        {
          linzAddressId: 'LINZ004',
          addressLine1: '12A Park Avenue',
          suburb: 'Riccarton',
          city: 'Christchurch',
          postcode: '8041',
          lat: -43.5330,
          lng: 172.5992,
          cvValue: 650000,
          rvValue: 630000,
          landAreaSqm: 280,
          floorAreaSqm: 95,
          yearBuilt: 2018,
          propertyType: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          sourceFlags: JSON.stringify(['LINZ', 'Council']),
        },
        {
          linzAddressId: 'LINZ005',
          addressLine1: '567 Hillside Road',
          suburb: 'Albany',
          city: 'Auckland',
          postcode: '0632',
          cvValue: 980000,
          rvValue: 950000,
          landAreaSqm: 380,
          floorAreaSqm: 160,
          yearBuilt: 2020,
          propertyType: 'house',
          bedrooms: 3,
          bathrooms: 2,
          sourceFlags: JSON.stringify(['LINZ', 'Council']),
        },
      ])
      .returning({ id: properties.id });

    logger.info(`Created ${propertyIds.length} properties`);

    // 4. Create sample sales data
    logger.info('Creating sales records...');
    await db.insert(sales).values([
      {
        propertyId: propertyIds[0].id,
        saleDate: new Date('2024-06-15'),
        salePrice: 1240000,
        source: 'Council',
        isInferred: false,
        confidenceScore: 0.95,
      },
      {
        propertyId: propertyIds[1].id,
        saleDate: new Date('2024-03-22'),
        salePrice: 1820000,
        source: 'Council',
        isInferred: false,
        confidenceScore: 0.95,
      },
      {
        propertyId: propertyIds[2].id,
        saleDate: new Date('2024-08-10'),
        salePrice: 745000,
        source: 'OneRoof',
        isInferred: false,
        confidenceScore: 0.90,
      },
    ]);

    logger.info('Created sales records');

    // 5. Create rental stats
    logger.info('Creating rental statistics...');
    await db.insert(rentalStats).values([
      {
        suburb: 'Albany',
        bedrooms: 3,
        weeklyRentMedian: 650,
        sampleSize: 45,
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
      },
      {
        suburb: 'Albany',
        bedrooms: 4,
        weeklyRentMedian: 780,
        sampleSize: 32,
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
      },
      {
        suburb: 'Browns Bay',
        bedrooms: 4,
        weeklyRentMedian: 850,
        sampleSize: 28,
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
      },
      {
        suburb: 'Lower Hutt',
        bedrooms: 3,
        weeklyRentMedian: 520,
        sampleSize: 67,
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
      },
      {
        suburb: 'Riccarton',
        bedrooms: 2,
        weeklyRentMedian: 480,
        sampleSize: 54,
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
      },
    ]);

    logger.info('Created rental statistics');

    // 6. Create valuations for properties
    logger.info('Creating valuations...');
    await db.insert(valuations).values([
      {
        propertyId: propertyIds[0].id,
        estimateValue: 1295000,
        estimateDate: new Date(),
        modelVersion: 'formula-v1',
        confidenceBandLow: 1165500,
        confidenceBandHigh: 1424500,
        features: JSON.stringify({
          baseValue: 1250000,
          adjustmentFactor: 1.036,
          suburb: 'Albany',
          propertyType: 'house',
          bedrooms: 4,
          bathrooms: 2,
          floorAreaSqm: 180,
          yearBuilt: 2015,
        }),
      },
      {
        propertyId: propertyIds[1].id,
        estimateValue: 1887000,
        estimateDate: new Date(),
        modelVersion: 'formula-v1',
        confidenceBandLow: 1698300,
        confidenceBandHigh: 2075700,
        features: JSON.stringify({
          baseValue: 1850000,
          adjustmentFactor: 1.02,
          suburb: 'Browns Bay',
          propertyType: 'house',
          bedrooms: 5,
          bathrooms: 3,
          floorAreaSqm: 250,
          yearBuilt: 2010,
        }),
      },
      {
        propertyId: propertyIds[2].id,
        estimateValue: 728000,
        estimateDate: new Date(),
        modelVersion: 'formula-v1',
        confidenceBandLow: 655200,
        confidenceBandHigh: 800800,
        features: JSON.stringify({
          baseValue: 750000,
          adjustmentFactor: 0.97,
          suburb: 'Lower Hutt',
          propertyType: 'townhouse',
          bedrooms: 3,
          bathrooms: 2,
          floorAreaSqm: 120,
          yearBuilt: 1998,
        }),
      },
      {
        propertyId: propertyIds[3].id,
        estimateValue: 663000,
        estimateDate: new Date(),
        modelVersion: 'formula-v1',
        confidenceBandLow: 596700,
        confidenceBandHigh: 729300,
        features: JSON.stringify({
          baseValue: 650000,
          adjustmentFactor: 1.02,
          suburb: 'Riccarton',
          propertyType: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          floorAreaSqm: 95,
          yearBuilt: 2018,
        }),
      },
      {
        propertyId: propertyIds[4].id,
        estimateValue: 1019600,
        estimateDate: new Date(),
        modelVersion: 'formula-v1',
        confidenceBandLow: 917640,
        confidenceBandHigh: 1121560,
        features: JSON.stringify({
          baseValue: 980000,
          adjustmentFactor: 1.04,
          suburb: 'Albany',
          propertyType: 'house',
          bedrooms: 3,
          bathrooms: 2,
          floorAreaSqm: 160,
          yearBuilt: 2020,
        }),
      },
    ]);

    logger.info('Created valuations');

    logger.info('Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if called directly
seed();
