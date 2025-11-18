import { db } from '../config/database.js';
import { agents, agentSubscriptions, agentMetrics } from '../models/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { CreateAgent, UpdateAgent } from '../models/zod-schemas.js';

export class AgentRepository {
  async findById(id: string) {
    const result = await db.query.agents.findFirst({
      where: eq(agents.id, id),
      with: {
        user: true,
        subscriptions: {
          where: eq(agentSubscriptions.isActive, true),
        },
      },
    });
    return result || null;
  }

  async findByUserId(userId: string) {
    const result = await db.query.agents.findFirst({
      where: eq(agents.userId, userId),
      with: {
        user: true,
        subscriptions: {
          where: eq(agentSubscriptions.isActive, true),
        },
      },
    });
    return result || null;
  }

  async findByEmail(email: string) {
    const result = await db.query.agents.findFirst({
      where: eq(agents.email, email),
    });
    return result || null;
  }

  async create(data: CreateAgent) {
    const id = nanoid();
    const [agent] = await db
      .insert(agents)
      .values({
        id,
        ...data,
      })
      .returning();
    return agent;
  }

  async update(id: string, data: UpdateAgent) {
    const [agent] = await db
      .update(agents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id))
      .returning();
    return agent || null;
  }

  async findActiveBySuburb(suburb: string) {
    return await db.query.agentSubscriptions.findMany({
      where: and(
        eq(agentSubscriptions.suburb, suburb),
        eq(agentSubscriptions.isActive, true),
        lte(agentSubscriptions.activeFrom, new Date()),
        gte(agentSubscriptions.activeTo, new Date())
      ),
      with: {
        agent: {
          with: {
            user: true,
          },
        },
      },
      orderBy: desc(agentSubscriptions.tier),
    });
  }

  async getMetrics(agentId: string, period: string) {
    const result = await db.query.agentMetrics.findFirst({
      where: and(
        eq(agentMetrics.agentId, agentId),
        eq(agentMetrics.period, period)
      ),
    });
    return result || null;
  }

  async upsertMetrics(
    agentId: string,
    period: string,
    data: {
      avgResponseTimeSeconds?: number;
      leadsAssigned?: number;
      leadsContacted?: number;
      leadsConverted?: number;
    }
  ) {
    const existing = await this.getMetrics(agentId, period);

    if (existing) {
      const [updated] = await db
        .update(agentMetrics)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(agentMetrics.id, existing.id))
        .returning();
      return updated;
    } else {
      const id = nanoid();
      const [created] = await db
        .insert(agentMetrics)
        .values({
          id,
          agentId,
          period,
          avgResponseTimeSeconds: data.avgResponseTimeSeconds || null,
          leadsAssigned: data.leadsAssigned || 0,
          leadsContacted: data.leadsContacted || 0,
          leadsConverted: data.leadsConverted || 0,
        })
        .returning();
      return created;
    }
  }
}
