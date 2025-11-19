import { AgentRepository } from '../repositories/agent.repository.js';
import { LeadRepository } from '../repositories/lead.repository.js';
import { logger } from '../config/logger.js';
import { emailQueue } from '../config/bullmq.js';
import type { CreateLead } from '../models/zod-schemas.js';

interface RankedAgent {
  agentId: string;
  agentName: string;
  tier: string;
  score: number;
  leadsThisMonth: number;
  leadCap: number | null;
}

export class LeadRoutingService {
  private agentRepo: AgentRepository;
  private leadRepo: LeadRepository;

  constructor() {
    this.agentRepo = new AgentRepository();
    this.leadRepo = new LeadRepository();
  }

  /**
   * Route a lead to the best available agent
   */
  async routeLead(leadData: CreateLead): Promise<{ lead: any; assignedAgent: any | null }> {
    // Create the lead first
    const lead = await this.leadRepo.create(leadData);

    // Find agents subscribed to this suburb
    const subscriptions = await this.agentRepo.findActiveBySuburb(leadData.suburb);

    if (subscriptions.length === 0) {
      logger.warn(`No agents found for suburb: ${leadData.suburb}`);
      return { lead, assignedAgent: null };
    }

    // Rank agents
    const rankedAgents = await this.rankAgents(subscriptions);

    if (rankedAgents.length === 0) {
      logger.warn(`No eligible agents for suburb: ${leadData.suburb}`);
      return { lead, assignedAgent: null };
    }

    // Assign to top-ranked agent
    const topAgent = rankedAgents[0];
    const updatedLead = await this.leadRepo.assignAgent(lead.id, topAgent.agentId);

    logger.info(`Lead ${lead.id} assigned to agent ${topAgent.agentId} (${topAgent.agentName})`);

    // Update agent metrics
    const period = this.getCurrentPeriod();
    const currentMetrics = await this.agentRepo.getMetrics(topAgent.agentId, period);
    await this.agentRepo.upsertMetrics(topAgent.agentId, period, {
      leadsAssigned: (currentMetrics?.leadsAssigned || 0) + 1,
      leadsContacted: currentMetrics?.leadsContacted || 0,
      leadsConverted: currentMetrics?.leadsConverted || 0,
    });

    // Queue email notification to the agent
    const assignedAgent = subscriptions.find(s => s.agent.id === topAgent.agentId)?.agent;
    if (assignedAgent) {
      await emailQueue.add('lead-notification', {
        type: 'lead-notification',
        data: {
          agentEmail: assignedAgent.email,
          agentName: assignedAgent.name,
          leadName: leadData.name,
          leadEmail: leadData.email,
          leadPhone: leadData.phone,
          leadMessage: leadData.message,
          leadType: leadData.leadType,
          suburb: leadData.suburb,
        },
      });
      logger.info(`Email notification queued for agent ${assignedAgent.email}`);
    }

    return { lead: updatedLead, assignedAgent };
  }

  /**
   * Rank agents based on tier, quota, response time, and conversion rate
   */
  private async rankAgents(subscriptions: any[]): Promise<RankedAgent[]> {
    const ranked: RankedAgent[] = [];

    for (const subscription of subscriptions) {
      const agent = subscription.agent;
      const agentId = agent.id;

      // Check lead cap
      const leadsThisMonth = await this.leadRepo.countByAgentThisMonth(agentId);
      const leadCap = subscription.leadCapPerMonth;

      // Skip if agent has reached their cap
      if (leadCap && leadsThisMonth >= leadCap) {
        logger.info(`Agent ${agentId} has reached lead cap (${leadsThisMonth}/${leadCap})`);
        continue;
      }

      // Get metrics for scoring
      const period = this.getCurrentPeriod();
      const metrics = await this.agentRepo.getMetrics(agentId, period);

      // Calculate score
      let score = 0;

      // Tier weight (seller=100, premium=50, basic=10)
      const tierWeights = { seller: 100, premium: 50, basic: 10 };
      score += tierWeights[subscription.tier as keyof typeof tierWeights] || 0;

      // Response time bonus (faster = better)
      if (metrics?.avgResponseTimeSeconds) {
        const responseBonus = Math.max(0, 50 - metrics.avgResponseTimeSeconds / 3600); // Up to 50 points
        score += responseBonus;
      }

      // Conversion rate bonus
      if (metrics?.leadsAssigned && metrics.leadsAssigned > 0) {
        const conversionRate = metrics.leadsConverted / metrics.leadsAssigned;
        score += conversionRate * 30; // Up to 30 points
      }

      // Quota utilization penalty (prefer agents with lower utilization)
      if (leadCap) {
        const utilization = leadsThisMonth / leadCap;
        score -= utilization * 20; // Up to -20 points
      }

      ranked.push({
        agentId,
        agentName: agent.name,
        tier: subscription.tier,
        score,
        leadsThisMonth,
        leadCap,
      });
    }

    // Sort by score descending
    return ranked.sort((a, b) => b.score - a.score);
  }

  /**
   * Get current period in YYYY-MM format
   */
  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
