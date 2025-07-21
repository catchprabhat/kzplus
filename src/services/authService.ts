import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService, AdminUser } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AdminUser;
  message?: string;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(userId: number, username: string): string {
    return jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const admin = await databaseService.getAdminByUsername(username);
      
      if (!admin) {
        return { success: false, message: 'Invalid credentials' };
      }

      const isValidPassword = await this.comparePassword(password, admin.password_hash);
      
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' };
      }

      const token = this.generateToken(admin.id!, admin.username);
      
      return {
        success: true,
        token,
        user: admin,
        message: 'Login successful'
      };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }

  async createAdminUser(username: string, email: string, password: string): Promise<AdminUser> {
    const hashedPassword = await this.hashPassword(password);
    return databaseService.createAdminUser({
      username,
      email,
      password_hash: hashedPassword
    });
  }
}

export const authService = new AuthService();