import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const authService = new AuthService();
const otpService = new OtpService();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'DONOR', 'NGO', 'RECIPIENT']),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  donorType: z.string().optional(),
  registrationId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const profile = await authService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const profile = await authService.updateProfile(userId, req.body);
      return res.status(200).json(profile);
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
      }
      const token = await authService.forgotPassword(email);
      return res.status(200).json({ message: 'Reset token generated.', token });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Request failed.' });
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
      }
      await authService.resetPassword(token, password);
      return res.status(200).json({ message: 'Password reset successful.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Reset failed.' });
    }
  }

  async sendEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP code are required.' });
      }
      await otpService.sendEmailOtp(email, otp);
      return res.status(200).json({ message: 'Email OTP sent successfully.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to send email OTP.' });
    }
  }

  async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone and OTP code are required.' });
      }
      const warning = await otpService.sendPhoneOtp(phone, otp);
      return res.status(200).json({ 
        message: 'Phone OTP sent successfully.',
        warning: warning || undefined
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to send phone OTP.' });
    }
  }
}
