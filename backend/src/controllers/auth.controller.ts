import { Request, Response } from 'express';
import { passwordResetService } from '../services/passwordReset.service';
import { z } from 'zod';

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export class AuthController {
  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = requestResetSchema.parse(req.body);

      const result = await passwordResetService.initiatePasswordReset(email);

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Request password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const result = await passwordResetService.verifyResetToken(token);

      res.json(result);
    } catch (error: any) {
      console.error('Verify reset token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      const result = await passwordResetService.resetPassword(token, password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
