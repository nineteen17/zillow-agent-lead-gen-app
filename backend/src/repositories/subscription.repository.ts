import { db } from '../config/database.js';
import { agentSubscriptions } from '../models/schema.js';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { CreateSubscription } from '../models/zod-schemas.js';

export class SubscriptionRepository {
  async findById(id: string) {
    const result = await db.query.agentSubscriptions.findFirst({
      where: eq(agentSubscriptions.id, id),
      with: {
        agent: {
          with: {
            user: true,
          },
        },
      },
    });
    return result || null;
  }

  async findByAgent(agentId: string) {
    return await db.query.agentSubscriptions.findMany({
      where: eq(agentSubscriptions.agentId, agentId),
    });
  }

  async findActiveByAgent(agentId: string) {
    return await db.query.agentSubscriptions.findMany({
      where: and(
        eq(agentSubscriptions.agentId, agentId),
        eq(agentSubscriptions.isActive, true)
      ),
    });
  }

  async create(data: CreateSubscription) {
    const id = nanoid();
    const [subscription] = await db
      .insert(agentSubscriptions)
      .values({
        id,
        ...data,
      })
      .returning();
    return subscription;
  }

  async update(
    id: string,
    data: Partial<Omit<CreateSubscription, 'agentId'>>
  ) {
    const [subscription] = await db
      .update(agentSubscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(agentSubscriptions.id, id))
      .returning();
    return subscription || null;
  }

  async deactivate(id: string) {
    const [subscription] = await db
      .update(agentSubscriptions)
      .set({
        isActive: false,
        activeTo: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentSubscriptions.id, id))
      .returning();
    return subscription || null;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    const result = await db.query.agentSubscriptions.findFirst({
      where: eq(agentSubscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
    return result || null;
  }
}
