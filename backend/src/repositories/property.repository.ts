import { db } from '../config/database.js';
import { properties, sales, valuations } from '../models/schema.js';
import { eq, and, gte, lte, ilike, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { CreateProperty, UpdateProperty, PropertySearch } from '../models/zod-schemas.js';

export class PropertyRepository {
  async findById(id: string) {
    const result = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        sales: {
          orderBy: desc(sales.saleDate),
          limit: 5,
        },
        valuations: {
          orderBy: desc(valuations.estimateDate),
          limit: 1,
        },
      },
    });
    return result || null;
  }

  async search(params: PropertySearch) {
    const {
      query,
      suburb,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      page = 1,
      limit = 20,
    } = params;

    const offset = (page - 1) * limit;
    const conditions = [];

    if (query) {
      conditions.push(ilike(properties.addressLine1, `%${query}%`));
    }
    if (suburb) {
      conditions.push(eq(properties.suburb, suburb));
    }
    if (city) {
      conditions.push(eq(properties.city, city));
    }
    if (bedrooms) {
      conditions.push(eq(properties.bedrooms, bedrooms));
    }
    if (bathrooms) {
      conditions.push(gte(properties.bathrooms, bathrooms));
    }
    if (propertyType) {
      conditions.push(eq(properties.propertyType, propertyType));
    }
    if (minPrice) {
      conditions.push(gte(properties.cvValue, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(properties.cvValue, maxPrice));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db.query.properties.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: desc(properties.updatedAt),
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      properties: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateProperty) {
    const id = nanoid();
    const [property] = await db
      .insert(properties)
      .values({
        id,
        ...data,
      })
      .returning();
    return property;
  }

  async update(id: string, data: UpdateProperty) {
    const [property] = await db
      .update(properties)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return property || null;
  }

  async delete(id: string) {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async findBySuburb(suburb: string, limit = 50) {
    return await db.query.properties.findMany({
      where: eq(properties.suburb, suburb),
      limit,
      orderBy: desc(properties.updatedAt),
    });
  }

  async getSuburbStats(suburb: string) {
    const [stats] = await db
      .select({
        totalProperties: sql<number>`count(*)`,
        avgCvValue: sql<number>`avg(${properties.cvValue})`,
        medianCvValue: sql<number>`percentile_cont(0.5) within group (order by ${properties.cvValue})`,
      })
      .from(properties)
      .where(eq(properties.suburb, suburb));

    return stats || null;
  }

  async getSuburbDetailedStats(suburb: string) {
    // Get property counts by type
    const propertyStats = await db
      .select({
        totalProperties: sql<number>`count(*)`,
        avgCvValue: sql<number>`avg(${properties.cvValue})`,
        medianCvValue: sql<number>`percentile_cont(0.5) within group (order by ${properties.cvValue})`,
        avgBedrooms: sql<number>`avg(${properties.bedrooms})`,
        avgBathrooms: sql<number>`avg(${properties.bathrooms})`,
        avgLandArea: sql<number>`avg(${properties.landAreaSqm})`,
        avgFloorArea: sql<number>`avg(${properties.floorAreaSqm})`,
      })
      .from(properties)
      .where(eq(properties.suburb, suburb));

    // Get sales statistics for last 3, 6, and 12 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [salesStats3M] = await db
      .select({
        count: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(${sales.salePrice})`,
        medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${sales.salePrice})`,
        minPrice: sql<number>`min(${sales.salePrice})`,
        maxPrice: sql<number>`max(${sales.salePrice})`,
      })
      .from(sales)
      .innerJoin(properties, eq(sales.propertyId, properties.id))
      .where(and(
        eq(properties.suburb, suburb),
        gte(sales.saleDate, threeMonthsAgo)
      ));

    const [salesStats6M] = await db
      .select({
        count: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(${sales.salePrice})`,
        medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${sales.salePrice})`,
      })
      .from(sales)
      .innerJoin(properties, eq(sales.propertyId, properties.id))
      .where(and(
        eq(properties.suburb, suburb),
        gte(sales.saleDate, sixMonthsAgo)
      ));

    const [salesStats12M] = await db
      .select({
        count: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(${sales.salePrice})`,
        medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${sales.salePrice})`,
      })
      .from(sales)
      .innerJoin(properties, eq(sales.propertyId, properties.id))
      .where(and(
        eq(properties.suburb, suburb),
        gte(sales.saleDate, twelveMonthsAgo)
      ));

    return {
      suburb,
      propertyStats: propertyStats[0],
      salesStats: {
        last3Months: salesStats3M,
        last6Months: salesStats6M,
        last12Months: salesStats12M,
      },
    };
  }

  async getSuburbRecentSales(suburb: string, limit = 20) {
    const recentSales = await db
      .select({
        id: sales.id,
        propertyId: sales.propertyId,
        saleDate: sales.saleDate,
        salePrice: sales.salePrice,
        addressLine1: properties.addressLine1,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        propertyType: properties.propertyType,
        landAreaSqm: properties.landAreaSqm,
        floorAreaSqm: properties.floorAreaSqm,
      })
      .from(sales)
      .innerJoin(properties, eq(sales.propertyId, properties.id))
      .where(eq(properties.suburb, suburb))
      .orderBy(desc(sales.saleDate))
      .limit(limit);

    return recentSales;
  }

  async getSuburbPriceTrends(suburb: string, monthsBack = 24) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const trends = await db
      .select({
        month: sql<string>`to_char(${sales.saleDate}, 'YYYY-MM')`,
        avgPrice: sql<number>`avg(${sales.salePrice})`,
        medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${sales.salePrice})`,
        salesCount: sql<number>`count(*)`,
      })
      .from(sales)
      .innerJoin(properties, eq(sales.propertyId, properties.id))
      .where(and(
        eq(properties.suburb, suburb),
        gte(sales.saleDate, startDate)
      ))
      .groupBy(sql`to_char(${sales.saleDate}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${sales.saleDate}, 'YYYY-MM')`);

    return trends;
  }

  async getAllSuburbs() {
    const suburbs = await db
      .selectDistinct({ suburb: properties.suburb })
      .from(properties)
      .where(sql`${properties.suburb} IS NOT NULL AND ${properties.suburb} != ''`)
      .orderBy(properties.suburb);

    return suburbs.map(s => s.suburb);
  }
}
