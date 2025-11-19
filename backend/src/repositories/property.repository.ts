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
}
