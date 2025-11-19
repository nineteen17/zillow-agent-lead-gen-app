import { db } from '../config/database.js';
import { emailSubscriptions, alertHistory } from '../models/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export class EmailSubscriptionRepository {
  async create(data: {
    email: string;
    suburb?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    alertTypes: string[];
  }) {
    const id = nanoid();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const [subscription] = await db
      .insert(emailSubscriptions)
      .values({
        id,
        ...data,
        verificationToken,
        unsubscribeToken,
        isActive: true,
      })
      .returning();

    return subscription;
  }

  async findByEmail(email: string) {
    return await db.query.emailSubscriptions.findMany({
      where: eq(emailSubscriptions.email, email),
    });
  }

  async findById(id: string) {
    return await db.query.emailSubscriptions.findFirst({
      where: eq(emailSubscriptions.id, id),
    });
  }

  async findByVerificationToken(token: string) {
    return await db.query.emailSubscriptions.findFirst({
      where: eq(emailSubscriptions.verificationToken, token),
    });
  }

  async findByUnsubscribeToken(token: string) {
    return await db.query.emailSubscriptions.findFirst({
      where: eq(emailSubscriptions.unsubscribeToken, token),
    });
  }

  async verify(id: string) {
    const [subscription] = await db
      .update(emailSubscriptions)
      .set({
        verifiedAt: new Date(),
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(emailSubscriptions.id, id))
      .returning();

    return subscription;
  }

  async unsubscribe(id: string) {
    const [subscription] = await db
      .update(emailSubscriptions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(emailSubscriptions.id, id))
      .returning();

    return subscription;
  }

  async findActiveBySuburb(suburb: string) {
    return await db.query.emailSubscriptions.findMany({
      where: and(
        eq(emailSubscriptions.suburb, suburb),
        eq(emailSubscriptions.isActive, true),
        sql`${emailSubscriptions.verifiedAt} IS NOT NULL`
      ),
    });
  }

  async findActiveAll() {
    return await db.query.emailSubscriptions.findMany({
      where: and(
        eq(emailSubscriptions.isActive, true),
        sql`${emailSubscriptions.verifiedAt} IS NOT NULL`
      ),
    });
  }

  async createAlertHistory(data: {
    subscriptionId: string;
    alertType: 'price_change' | 'new_sales' | 'market_trends';
    suburb: string;
    data?: any;
  }) {
    const id = nanoid();

    const [alert] = await db
      .insert(alertHistory)
      .values({
        id,
        ...data,
        sentAt: new Date(),
      })
      .returning();

    return alert;
  }

  async findRecentAlerts(subscriptionId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await db.query.alertHistory.findMany({
      where: and(
        eq(alertHistory.subscriptionId, subscriptionId),
        sql`${alertHistory.sentAt} >= ${since}`
      ),
    });
  }
}
