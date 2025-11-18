import { AgentRepository } from '../repositories/agent.repository.js';
import { LeadRepository } from '../repositories/lead.repository.js';
import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import { logger } from '../config/logger.js';
import type { CreateAgent, UpdateAgent, LeadStatus } from '../models/zod-schemas.js';

export class AgentService {
  private agentRepo: AgentRepository;
  private leadRepo: LeadRepository;
  private subscriptionRepo: SubscriptionRepository;

  constructor() {
    this.agentRepo = new AgentRepository();
    this.leadRepo = new LeadRepository();
    this.subscriptionRepo = new SubscriptionRepository();
  }

  async getAgentByUserId(userId: string) {
    return await this.agentRepo.findByUserId(userId);
  }

  async getAgentById(id: string) {
    return await this.agentRepo.findById(id);
  }

  async createAgent(data: CreateAgent) {
    const agent = await this.agentRepo.create(data);
    logger.info(`Agent created: ${agent.id} for user ${agent.userId}`);
    return agent;
  }

  async updateAgent(id: string, data: UpdateAgent) {
    const agent = await this.agentRepo.update(id, data);
    if (agent) {
      logger.info(`Agent updated: ${id}`);
    }
    return agent;
  }

  async getAgentLeads(agentId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const leads = await this.leadRepo.findByAgent(agentId, limit, offset);
    return leads;
  }

  async updateLeadStatus(leadId: string, agentId: string, status: LeadStatus) {
    // Verify the lead belongs to this agent
    const lead = await this.leadRepo.findById(leadId);
    if (!lead || lead.assignedAgentId !== agentId) {
      throw new Error('Lead not found or not assigned to this agent');
    }

    const updatedLead = await this.leadRepo.updateStatus(leadId, status);

    // Update agent metrics
    const period = this.getCurrentPeriod();
    const metrics = await this.agentRepo.getMetrics(agentId, period);

    const updates: {
      leadsContacted?: number;
      leadsConverted?: number;
    } = {};

    if (status === 'contacted' && lead.status !== 'contacted') {
      updates.leadsContacted = (metrics?.leadsContacted || 0) + 1;
    }

    if (status === 'closed_won' && lead.status !== 'closed_won') {
      updates.leadsConverted = (metrics?.leadsConverted || 0) + 1;
    }

    if (Object.keys(updates).length > 0) {
      await this.agentRepo.upsertMetrics(agentId, period, {
        ...metrics,
        ...updates,
      });
    }

    logger.info(`Lead ${leadId} status updated to ${status} by agent ${agentId}`);
    return updatedLead;
  }

  async getAgentMetrics(agentId: string, period?: string) {
    const targetPeriod = period || this.getCurrentPeriod();
    return await this.agentRepo.getMetrics(agentId, targetPeriod);
  }

  async getAgentSubscriptions(agentId: string) {
    return await this.subscriptionRepo.findActiveByAgent(agentId);
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
