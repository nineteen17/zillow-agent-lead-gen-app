import { db } from '../config/database.js';
import { leads } from '../models/schema.js';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { CreateLead, LeadStatus } from '../models/zod-schemas.js';

export class LeadRepository {
  async findById(id: string) {
    const result = await db.query.leads.findFirst({
      where: eq(leads.id, id),
      with: {
        property: true,
        assignedAgent: {
          with: {
            user: true,
          },
        },
      },
    });
    return result || null;
  }

  async create(data: CreateLead) {
    const id = nanoid();
    const [lead] = await db
      .insert(leads)
      .values({
        id,
        ...data,
      })
      .returning();
    return lead;
  }

  async updateStatus(id: string, status: LeadStatus) {
    const [lead] = await db
      .update(leads)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return lead || null;
  }

  async assignAgent(id: string, agentId: string) {
    const [lead] = await db
      .update(leads)
      .set({
        assignedAgentId: agentId,
        status: 'delivered',
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return lead || null;
  }

  async findByAgent(agentId: string, limit = 50, offset = 0) {
    return await db.query.leads.findMany({
      where: eq(leads.assignedAgentId, agentId),
      limit,
      offset,
      orderBy: desc(leads.createdAt),
      with: {
        property: true,
      },
    });
  }

  async findBySuburb(suburb: string, limit = 50) {
    return await db.query.leads.findMany({
      where: eq(leads.suburb, suburb),
      limit,
      orderBy: desc(leads.createdAt),
    });
  }

  async countByAgentThisMonth(agentId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(
        and(
          eq(leads.assignedAgentId, agentId),
          gte(leads.createdAt, startOfMonth)
        )
      );

    return Number(result?.count || 0);
  }

  async getUnassignedLeads(limit = 100) {
    return await db.query.leads.findMany({
      where: eq(leads.status, 'new'),
      limit,
      orderBy: desc(leads.createdAt),
    });
  }
}
