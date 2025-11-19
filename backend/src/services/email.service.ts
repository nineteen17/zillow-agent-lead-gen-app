import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let resend: Resend | null = null;

if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export class EmailService {
  /**
   * Send lead notification to agent
   */
  async sendLeadNotification(params: {
    agentEmail: string;
    agentName: string;
    leadName: string;
    leadEmail: string;
    leadPhone?: string;
    leadMessage?: string;
    leadType: string;
    suburb: string;
  }) {
    if (!resend || !env.RESEND_API_KEY) {
      logger.warn('Resend not configured, skipping email send');
      return null;
    }

    try {
      const { agentEmail, agentName, leadName, leadEmail, leadPhone, leadMessage, leadType, suburb } = params;

      const result = await resend.emails.send({
        from: `${env.EMAIL_FROM_NAME || 'Zillow NZ'} <${env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
        to: agentEmail,
        subject: `New ${leadType} lead from ${suburb}`,
        html: this.generateLeadNotificationHTML(params),
      });

      logger.info(`Lead notification email sent to ${agentEmail}`);
      return result;
    } catch (error) {
      logger.error('Failed to send lead notification email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new agent
   */
  async sendAgentWelcomeEmail(params: {
    agentEmail: string;
    agentName: string;
  }) {
    if (!resend || !env.RESEND_API_KEY) {
      logger.warn('Resend not configured, skipping email send');
      return null;
    }

    try {
      const { agentEmail, agentName } = params;

      const result = await resend.emails.send({
        from: `${env.EMAIL_FROM_NAME || 'Zillow NZ'} <${env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
        to: agentEmail,
        subject: 'Welcome to Zillow NZ Premier Agent',
        html: this.generateWelcomeEmailHTML(agentName),
      });

      logger.info(`Welcome email sent to ${agentEmail}`);
      return result;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  /**
   * Generate lead notification HTML (simplified for MVP)
   */
  private generateLeadNotificationHTML(params: {
    agentName: string;
    leadName: string;
    leadEmail: string;
    leadPhone?: string;
    leadMessage?: string;
    leadType: string;
    suburb: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .lead-info { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Lead Alert!</h1>
            </div>
            <div class="content">
              <p>Hi ${params.agentName},</p>
              <p>You have a new <strong>${params.leadType}</strong> lead from <strong>${params.suburb}</strong>.</p>

              <div class="lead-info">
                <p><span class="label">Name:</span> ${params.leadName}</p>
                <p><span class="label">Email:</span> <a href="mailto:${params.leadEmail}">${params.leadEmail}</a></p>
                ${params.leadPhone ? `<p><span class="label">Phone:</span> <a href="tel:${params.leadPhone}">${params.leadPhone}</a></p>` : ''}
                ${params.leadMessage ? `<p><span class="label">Message:</span><br>${params.leadMessage}</p>` : ''}
              </div>

              <p><strong>Action Required:</strong> Please contact this lead as soon as possible to maximize your conversion rate.</p>

              <a href="${env.FRONTEND_URL}/agent/dashboard" class="button">View Lead in Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(params: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    if (!resend || !env.RESEND_API_KEY) {
      logger.warn('Resend not configured, skipping email send');
      return null;
    }

    try {
      const result = await resend.emails.send({
        from: `${env.EMAIL_FROM_NAME || 'Zillow NZ'} <${env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
        to: params.to,
        subject: 'Reset your password',
        html: this.generatePasswordResetHTML(params),
      });

      logger.info(`Password reset email sent to ${params.to}`);
      return result;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeEmailHTML(agentName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Zillow NZ!</h1>
            </div>
            <div class="content">
              <p>Hi ${agentName},</p>
              <p>Welcome to Zillow NZ Premier Agent! We're excited to have you on board.</p>
              <p>You can now start receiving qualified leads in your area. Log in to your dashboard to:</p>
              <ul>
                <li>Manage your leads</li>
                <li>View your performance metrics</li>
                <li>Update your profile</li>
                <li>Manage your subscriptions</li>
              </ul>
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate password reset email HTML
   */
  private generatePasswordResetHTML(params: {
    name: string;
    resetUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${params.name},</p>
              <p>We received a request to reset your password. Click the button below to choose a new password:</p>
              <a href="${params.resetUrl}" class="button">Reset Password</a>
              <p class="warning">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
