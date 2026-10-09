import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      ...data,
      passwordHash,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(credentials: any) {
    const { email, password } = credentials;
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: any) {
    const existing = await userRepository.findById(userId);
    if (!existing) {
      throw new Error('User not found.');
    }
    const updated = await userRepository.update(userId, {
      ...existing,
      ...data,
    });
    return this.sanitizeUser(updated);
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('No account found with this email address.');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return token;
  }

  async resetPassword(token: string, passwordHash: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;
      
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found.');
      }
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(passwordHash, salt);
      
      await userRepository.updatePassword(userId, hash);
    } catch (err: any) {
      throw new Error(err.message || 'Invalid or expired reset token.');
    }
  }

  private generateToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        donorId: user.donorProfile?.id || null,
        ngoId: user.ngoProfile?.id || null,
        recipientId: user.recipientProfile?.id || null,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  private sanitizeUser(user: any) {
    const sanitized = { ...user };
    delete sanitized.passwordHash;
    return sanitized;
  }
}
