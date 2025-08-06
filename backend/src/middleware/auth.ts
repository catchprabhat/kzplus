import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define interface for admin payload to match admin.ts
interface Admin {
  adminId: number; // Changed from string to number
  username: string;
  role: string;
}

interface AuthRequest extends Request {
  admin?: Admin;
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as Admin;

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};