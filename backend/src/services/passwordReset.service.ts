import { db } from '../config/database';
import { passwordResetTokens, users } from '../models/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';
import { emailService } from './email.service';

export class PasswordResetService {
  /**
   * Generate and send password reset email
   */
  async initiatePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return { success: true, message: 'If that email exists, a reset link has been sent.' };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    await db.insert(passwordResetTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt,
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name || 'User',
      resetUrl,
    });

    return { success: true, message: 'If that email exists, a reset link has been sent.' };
  }

  /**
   * Verify reset token is valid
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!resetToken) {
      return { valid: false };
    }

    return { valid: true, userId: resetToken.userId };
  }

  /**
   * Reset password using valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const verification = await this.verifyResetToken(token);

    if (!verification.valid || !verification.userId) {
      return { success: false, message: 'Invalid or expired token' };
    }

    // Hash the new password using BetterAuth's password hashing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in accounts table
    const { accounts } = await import('../models/schema');
    await db.update(accounts)
      .set({ password: hashedPassword })
      .where(eq(accounts.userId, verification.userId));

    // Delete used token
    await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    return { success: true, message: 'Password reset successfully' };
  }

  /**
   * Clean up expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await db.delete(passwordResetTokens)
      .where(gt(new Date(), passwordResetTokens.expiresAt));

    return result.rowCount || 0;
  }
}

export const passwordResetService = new PasswordResetService();
