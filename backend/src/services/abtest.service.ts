import { db } from '../config/database';
import { experiments, experimentAssignments, experimentEvents } from '../models/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

export class ABTestService {
  /**
   * Create a new A/B test experiment
   */
  async createExperiment(params: {
    name: string;
    description?: string;
    variants: Array<{
      id: string;
      name: string;
      weight: number; // 0-100 percentage
      config: any;
    }>;
  }) {
    const experiment = await db.insert(experiments).values({
      id: crypto.randomUUID(),
      name: params.name,
      description: params.description,
      variants: params.variants,
      isActive: false,
    }).returning();

    return experiment[0];
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string) {
    await db.update(experiments)
      .set({
        isActive: true,
        startDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(experiments.id, experimentId));
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(experimentId: string) {
    await db.update(experiments)
      .set({
        isActive: false,
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(experiments.id, experimentId));
  }

  /**
   * Get variant for a user (assigns if not already assigned)
   */
  async getVariant(experimentId: string, userId?: string, sessionId?: string) {
    // Check if already assigned
    const existingAssignment = await db.query.experimentAssignments.findFirst({
      where: and(
        eq(experimentAssignments.experimentId, experimentId),
        userId ? eq(experimentAssignments.userId, userId) : sql`${experimentAssignments.sessionId} = ${sessionId}`
      ),
    });

    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Get experiment details
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.id, experimentId),
    });

    if (!experiment || !experiment.isActive) {
      return null;
    }

    // Assign variant based on weights
    const variantId = this.selectVariantByWeight(experiment.variants as any[]);

    // Save assignment
    await db.insert(experimentAssignments).values({
      id: crypto.randomUUID(),
      experimentId,
      userId,
      sessionId,
      variantId,
    });

    return variantId;
  }

  /**
   * Track an event for an experiment
   */
  async trackEvent(params: {
    experimentId: string;
    userId?: string;
    sessionId?: string;
    eventType: string;
    metadata?: any;
  }) {
    // Get assignment
    const assignment = await db.query.experimentAssignments.findFirst({
      where: and(
        eq(experimentAssignments.experimentId, params.experimentId),
        params.userId
          ? eq(experimentAssignments.userId, params.userId)
          : sql`${experimentAssignments.sessionId} = ${params.sessionId}`
      ),
    });

    if (!assignment) {
      console.warn('No assignment found for experiment event tracking');
      return;
    }

    await db.insert(experimentEvents).values({
      id: crypto.randomUUID(),
      experimentId: params.experimentId,
      assignmentId: assignment.id,
      eventType: params.eventType,
      metadata: params.metadata,
    });
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string) {
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.id, experimentId),
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Get assignments per variant
    const assignmentStats = await db
      .select({
        variantId: experimentAssignments.variantId,
        count: sql<number>`count(*)::int`,
      })
      .from(experimentAssignments)
      .where(eq(experimentAssignments.experimentId, experimentId))
      .groupBy(experimentAssignments.variantId);

    // Get conversion events per variant
    const conversionStats = await db
      .select({
        variantId: experimentAssignments.variantId,
        eventType: experimentEvents.eventType,
        count: sql<number>`count(*)::int`,
      })
      .from(experimentEvents)
      .innerJoin(
        experimentAssignments,
        eq(experimentEvents.assignmentId, experimentAssignments.id)
      )
      .where(eq(experimentEvents.experimentId, experimentId))
      .groupBy(experimentAssignments.variantId, experimentEvents.eventType);

    // Calculate conversion rates
    const variantResults = assignmentStats.map(stat => {
      const conversions = conversionStats.filter(
        c => c.variantId === stat.variantId && c.eventType === 'conversion'
      );
      const totalConversions = conversions.reduce((sum, c) => sum + c.count, 0);

      return {
        variantId: stat.variantId,
        assignments: stat.count,
        conversions: totalConversions,
        conversionRate: stat.count > 0 ? (totalConversions / stat.count) * 100 : 0,
        events: conversionStats.filter(c => c.variantId === stat.variantId),
      };
    });

    return {
      experiment,
      results: variantResults,
    };
  }

  /**
   * Select variant based on weighted distribution
   */
  private selectVariantByWeight(variants: Array<{ id: string; weight: number }>): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return variants[0].id;
  }
}

export const abTestService = new ABTestService();
