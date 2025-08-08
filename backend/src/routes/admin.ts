import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { sql } from '../config/database';
import { authenticateAdmin } from '../middleware/auth';

interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  role: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicle_number: string;
  vehicle_type: string;
  created_at: string;
  booking_count: number;
}

interface Booking {
  id: number;
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  total_price: number;
  notes: string;
  created_at: string;
  services: { name: string; price: number }[];
}

const router: Router = express.Router();

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const adminResult = await sql`SELECT * FROM admin_users WHERE username = ${username}` as AdminUser[];

      if (adminResult.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const admin = adminResult[0];
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Update the users query
router.get('/users', authenticateAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await sql`SELECT u.*, 
                           COUNT(sb.id) as booking_count
                           FROM users u
                           LEFT JOIN service_bookings sb ON sb.user_id = u.id
                           GROUP BY u.id
                           ORDER BY u.created_at DESC` as User[];

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update the bookings query
router.get('/bookings', authenticateAdmin, async (_req: Request, res: Response) => {
  try {
    const bookings = await sql`SELECT sb.*
                             FROM service_bookings sb
                             ORDER BY sb.created_at DESC` as Booking[];

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;