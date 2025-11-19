import { EmailSubscriptionRepository } from '../repositories/emailSubscription.repository.js';
import { EmailService } from './email.service.js';
import { logger } from '../config/logger.js';

export class EmailSubscriptionService {
  private subRepo: EmailSubscriptionRepository;
  private emailService: EmailService;

  constructor() {
    this.subRepo = new EmailSubscriptionRepository();
    this.emailService = new EmailService();
  }

  async subscribe(data: {
    email: string;
    suburb?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    alertTypes: string[];
  }) {
    // Create subscription
    const subscription = await this.subRepo.create(data);

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${subscription.verificationToken}`;

    await this.emailService.sendEmail({
      to: subscription.email,
      subject: 'Verify your email subscription',
      html: `
        <h2>Confirm Your Email Subscription</h2>
        <p>Thanks for subscribing to ${subscription.suburb || 'New Zealand'} property market alerts!</p>
        <p>You'll receive ${subscription.frequency} updates about:</p>
        <ul>
          ${subscription.alertTypes.map(type => `<li>${type.replace('_', ' ')}</li>`).join('')}
        </ul>
        <p><a href="${verifyUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
      `,
    });

    logger.info(`Email subscription created: ${subscription.id} for ${subscription.email}`);

    return subscription;
  }

  async verify(token: string) {
    const subscription = await this.subRepo.findByVerificationToken(token);

    if (!subscription) {
      throw new Error('Invalid verification token');
    }

    const verified = await this.subRepo.verify(subscription.id);

    logger.info(`Email subscription verified: ${verified.id}`);

    return verified;
  }

  async unsubscribe(token: string) {
    const subscription = await this.subRepo.findByUnsubscribeToken(token);

    if (!subscription) {
      throw new Error('Invalid unsubscribe token');
    }

    const unsubscribed = await this.subRepo.unsubscribe(subscription.id);

    logger.info(`Email subscription cancelled: ${unsubscribed.id}`);

    return unsubscribed;
  }

  async getByEmail(email: string) {
    return await this.subRepo.findByEmail(email);
  }
}
