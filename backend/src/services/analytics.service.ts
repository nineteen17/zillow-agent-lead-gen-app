import { db } from '../config/database';
import {
  leads,
  agentMetrics,
  agentSubscriptions,
  leadConversionEvents,
  agents,
} from '../models/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class AnalyticsService {
  /**
   * Track lead conversion event
   */
  async trackLeadEvent(params: {
    leadId: string;
    eventType: string;
    agentId?: string;
    metadata?: any;
  }) {
    await db.insert(leadConversionEvents).values({
      id: crypto.randomUUID(),
      leadId: params.leadId,
      eventType: params.eventType,
      agentId: params.agentId,
      metadata: params.metadata,
    });
  }

  /**
   * Get lead conversion funnel for agent
   */
  async getLeadConversionFunnel(params: {
    agentId: string;
    startDate: Date;
    endDate: Date;
  }) {
    const funnel = await db
      .select({
        eventType: leadConversionEvents.eventType,
        count: sql<number>`count(distinct ${leadConversionEvents.leadId})::int`,
      })
      .from(leadConversionEvents)
      .where(
        and(
          eq(leadConversionEvents.agentId, params.agentId),
          gte(leadConversionEvents.createdAt, params.startDate),
          lte(leadConversionEvents.createdAt, params.endDate)
        )
      )
      .groupBy(leadConversionEvents.eventType);

    return funnel;
  }

  /**
   * Get advanced agent performance analytics
   */
  async getAgentPerformanceAnalytics(agentId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    const startDate = this.getStartDate(now, period);

    // Get all leads for the period
    const agentLeads = await db.query.leads.findMany({
      where: and(
        eq(leads.assignedAgentId, agentId),
        gte(leads.createdAt, startDate)
      ),
    });

    // Get conversion events
    const events = await db.query.leadConversionEvents.findMany({
      where: and(
        eq(leadConversionEvents.agentId, agentId),
        gte(leadConversionEvents.createdAt, startDate)
      ),
    });

    // Calculate metrics
    const totalLeads = agentLeads.length;
    const contacted = agentLeads.filter(l => ['contacted', 'qualified', 'closed_won'].includes(l.status)).length;
    const qualified = agentLeads.filter(l => ['qualified', 'closed_won'].includes(l.status)).length;
    const won = agentLeads.filter(l => l.status === 'closed_won').length;

    // Calculate average response time (time from created to first contacted event)
    const responseTimes: number[] = [];
    for (const lead of agentLeads) {
      const contactedEvent = events.find(e => e.leadId === lead.id && e.eventType === 'contacted');
      if (contactedEvent) {
        const responseTime = contactedEvent.createdAt.getTime() - lead.createdAt.getTime();
        responseTimes.push(responseTime);
      }
    }

    const avgResponseTimeMs = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const avgResponseTimeHours = Math.round(avgResponseTimeMs / (1000 * 60 * 60) * 10) / 10;

    // Lead source breakdown
    const sourceBreakdown = agentLeads.reduce((acc, lead) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      totalLeads,
      contacted,
      qualified,
      won,
      contactRate: totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) : 0,
      qualificationRate: contacted > 0 ? Math.round((qualified / contacted) * 100) : 0,
      conversionRate: totalLeads > 0 ? Math.round((won / totalLeads) * 100) : 0,
      avgResponseTimeHours,
      sourceBreakdown,
    };
  }

  /**
   * Get revenue analytics (admin only)
   */
  async getRevenueAnalytics(params: {
    startDate: Date;
    endDate: Date;
  }) {
    const subscriptions = await db.query.agentSubscriptions.findMany({
      where: and(
        eq(agentSubscriptions.isActive, true),
        gte(agentSubscriptions.activeFrom, params.startDate),
        lte(agentSubscriptions.activeFrom, params.endDate)
      ),
      with: {
        agent: true,
      },
    });

    const totalMRR = subscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0);

    const byTier = subscriptions.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + sub.monthlyPrice;
      return acc;
    }, {} as Record<string, number>);

    const bySuburb = subscriptions.reduce((acc, sub) => {
      acc[sub.suburb] = (acc[sub.suburb] || 0) + sub.monthlyPrice;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMRR,
      totalSubscriptions: subscriptions.length,
      byTier,
      bySuburb,
      avgRevenuePerAgent: subscriptions.length > 0 ? totalMRR / subscriptions.length : 0,
    };
  }

  /**
   * Get lead volume trends over time
   */
  async getLeadVolumeTrends(params: {
    startDate: Date;
    endDate: Date;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const groupBy = params.groupBy || 'day';
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-IW',
      month: 'YYYY-MM',
    }[groupBy];

    const trends = await db
      .select({
        date: sql<string>`to_char(${leads.createdAt}, ${dateFormat})`,
        count: sql<number>`count(*)::int`,
        leadType: leads.leadType,
      })
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, params.startDate),
          lte(leads.createdAt, params.endDate)
        )
      )
      .groupBy(sql`to_char(${leads.createdAt}, ${dateFormat})`, leads.leadType)
      .orderBy(sql`to_char(${leads.createdAt}, ${dateFormat})`);

    return trends;
  }

  /**
   * Get top performing agents
   */
  async getTopPerformingAgents(limit = 10) {
    const topAgents = await db
      .select({
        agentId: leads.assignedAgentId,
        totalLeads: sql<number>`count(*)::int`,
        wonLeads: sql<number>`count(*) filter (where ${leads.status} = 'closed_won')::int`,
        conversionRate: sql<number>`round((count(*) filter (where ${leads.status} = 'closed_won')::numeric / count(*)) * 100, 2)`,
      })
      .from(leads)
      .where(sql`${leads.assignedAgentId} is not null`)
      .groupBy(leads.assignedAgentId)
      .having(sql`count(*) >= 5`) // At least 5 leads
      .orderBy(desc(sql`round((count(*) filter (where ${leads.status} = 'closed_won')::numeric / count(*)) * 100, 2)`))
      .limit(limit);

    return topAgents;
  }

  private getStartDate(now: Date, period: 'week' | 'month' | 'quarter' | 'year'): Date {
    const date = new Date(now);
    switch (period) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  }
}

export const analyticsService = new AnalyticsService();
