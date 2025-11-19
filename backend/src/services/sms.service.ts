import { db } from '../config/database';
import { smsNotifications, agents, agentPreferences } from '../models/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import twilio from 'twilio';

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';

export class SmsService {
  /**
   * Queue an SMS notification
   */
  async queueSms(params: {
    agentId: string;
    phoneNumber: string;
    message: string;
    leadId?: string;
  }): Promise<{ id: string }> {
    const notification = await db.insert(smsNotifications).values({
      id: crypto.randomUUID(),
      agentId: params.agentId,
      phoneNumber: params.phoneNumber,
      message: params.message,
      leadId: params.leadId,
      status: 'pending',
    }).returning();

    return { id: notification[0].id };
  }

  /**
   * Send SMS immediately (used by worker)
   */
  async sendSms(notificationId: string): Promise<void> {
    if (!twilioClient) {
      console.error('Twilio not configured - SMS notifications disabled');
      await db.update(smsNotifications)
        .set({
          status: 'failed',
          errorMessage: 'Twilio not configured',
        })
        .where(eq(smsNotifications.id, notificationId));
      return;
    }

    const notification = await db.query.smsNotifications.findFirst({
      where: eq(smsNotifications.id, notificationId),
    });

    if (!notification) {
      throw new Error('SMS notification not found');
    }

    try {
      const result = await twilioClient.messages.create({
        body: notification.message,
        from: TWILIO_FROM_NUMBER,
        to: notification.phoneNumber,
      });

      await db.update(smsNotifications)
        .set({
          status: 'sent',
          twilioMessageSid: result.sid,
          sentAt: new Date(),
        })
        .where(eq(smsNotifications.id, notificationId));

    } catch (error: any) {
      console.error('Error sending SMS:', error);
      await db.update(smsNotifications)
        .set({
          status: 'failed',
          errorMessage: error.message,
        })
        .where(eq(smsNotifications.id, notificationId));
      throw error;
    }
  }

  /**
   * Send new lead SMS notification
   */
  async sendNewLeadSms(params: {
    agentId: string;
    leadName: string;
    leadType: string;
    suburb: string;
    leadId: string;
  }): Promise<void> {
    // Check if agent has SMS notifications enabled
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, params.agentId),
      with: {
        user: true,
      },
    });

    if (!agent || !agent.phone) {
      return; // No phone number
    }

    // Check preferences
    const preferences = await db.query.agentPreferences.findFirst({
      where: eq(agentPreferences.agentId, params.agentId),
    });

    if (preferences && (!preferences.smsNotifications || !preferences.notifyOnNewLead)) {
      return; // SMS disabled
    }

    const message = `New ${params.leadType} lead: ${params.leadName} in ${params.suburb}. Check your dashboard: ${process.env.FRONTEND_URL}/agent/dashboard`;

    await this.queueSms({
      agentId: params.agentId,
      phoneNumber: agent.phone,
      message,
      leadId: params.leadId,
    });
  }

  /**
   * Handle Twilio webhook for delivery status
   */
  async handleDeliveryStatus(params: {
    messageSid: string;
    status: string;
  }): Promise<void> {
    const notification = await db.query.smsNotifications.findFirst({
      where: eq(smsNotifications.twilioMessageSid, params.messageSid),
    });

    if (!notification) {
      return;
    }

    if (params.status === 'delivered') {
      await db.update(smsNotifications)
        .set({
          status: 'delivered',
          deliveredAt: new Date(),
        })
        .where(eq(smsNotifications.twilioMessageSid, params.messageSid));
    } else if (params.status === 'failed' || params.status === 'undelivered') {
      await db.update(smsNotifications)
        .set({ status: 'failed' })
        .where(eq(smsNotifications.twilioMessageSid, params.messageSid));
    }
  }
}

export const smsService = new SmsService();
