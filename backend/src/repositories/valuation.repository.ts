import { db } from '../config/database.js';
import { valuations } from '../models/schema.js';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export class ValuationRepository {
  async findByPropertyId(propertyId: string) {
    const result = await db.query.valuations.findFirst({
      where: eq(valuations.propertyId, propertyId),
      orderBy: desc(valuations.estimateDate),
    });
    return result || null;
  }

  async findAllByPropertyId(propertyId: string, limit = 10) {
    return await db.query.valuations.findMany({
      where: eq(valuations.propertyId, propertyId),
      orderBy: desc(valuations.estimateDate),
      limit,
    });
  }

  async create(data: {
    propertyId: string;
    estimateValue: number;
    modelVersion: string;
    confidenceBandLow?: number;
    confidenceBandHigh?: number;
    features?: Record<string, unknown>;
  }) {
    const id = nanoid();
    const [valuation] = await db
      .insert(valuations)
      .values({
        id,
        estimateDate: new Date(),
        ...data,
      })
      .returning();
    return valuation;
  }

  async delete(id: string) {
    await db.delete(valuations).where(eq(valuations.id, id));
  }
}
