import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sql } from '../config/database';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicle_number: string;
  vehicle_type: string;
  created_at: string;
}

const router: Router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        phone,
        address,
        vehicleNumber,
        vehicleType,
      } = req.body;

      const existingUser = await sql`SELECT id FROM users WHERE email = ${email} OR phone = ${phone} OR vehicle_number = ${vehicleNumber.toUpperCase()}` as User[];

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ error: 'User already exists with this email, phone, or vehicle number' });
      }

      const userResult = await sql`
        INSERT INTO users (name, email, phone, address, vehicle_number, vehicle_type)
        VALUES (${name}, ${email}, ${phone}, ${address || ''}, ${vehicleNumber.toUpperCase()}, ${vehicleType})
        RETURNING id, name, email, phone, vehicle_number, vehicle_type, created_at
      ` as User[];

      const user = userResult[0];

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Update the search queries in users.ts
router.get('/search/phone/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await sql`
      SELECT 
        u.*,
        (SELECT sb.scheduled_date 
         FROM service_bookings sb 
         WHERE sb.user_id = u.id 
         ORDER BY sb.scheduled_date DESC 
         LIMIT 1) as last_serviced_date,
        (SELECT (sb.services->0->>'name')::text 
         FROM service_bookings sb 
         WHERE sb.user_id = u.id 
         ORDER BY sb.scheduled_date DESC 
         LIMIT 1) as last_service_type
      FROM users u
      WHERE u.phone = ${phone}` as (User & {
        last_serviced_date?: string | null;
        last_service_type?: string | null;
      })[];

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      phone: result[0].phone,
      address: result[0].address,
      vehicle_number: result[0].vehicle_number,
      vehicle_type: result[0].vehicle_type,
      created_at: result[0].created_at,
      last_serviced_date: result[0].last_serviced_date,
      last_service_type: result[0].last_service_type,
    };

    res.json(user);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/search/vehicle/:vehicleNumber', async (req: Request, res: Response) => {
  try {
    const { vehicleNumber } = req.params;

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

    const result = await sql`
      SELECT 
        u.*,
        (SELECT sb.scheduled_date 
         FROM service_bookings sb 
         WHERE sb.user_id = u.id 
         ORDER BY sb.scheduled_date DESC 
         LIMIT 1) as last_serviced_date,
        (SELECT (sb.services->0->>'name')::text 
         FROM service_bookings sb 
         WHERE sb.user_id = u.id 
         ORDER BY sb.scheduled_date DESC 
         LIMIT 1) as last_service_type
      FROM users u
      WHERE u.vehicle_number = ${vehicleNumber.toUpperCase()}` as (User & {
        last_serviced_date?: string | null;
        last_service_type?: string | null;
      })[];

    if (result.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const user = {
      id: result[0].id,
      vehicle_number: result[0].vehicle_number,
      vehicle_type: result[0].vehicle_type,
      name: result[0].name,
      email: result[0].email,
      phone: result[0].phone,
      last_serviced_date: result[0].last_serviced_date,
      last_service_type: result[0].last_service_type,
    };

    res.json(user);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Add this new endpoint after the existing routes
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      vehicleNumber,
      vehicleType,
      address
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update user profile with vehicle information
    const result = await sql`
      UPDATE users 
      SET 
        vehicle_number = ${vehicleNumber ? vehicleNumber.toUpperCase() : null},
        vehicle_type = ${vehicleType || null},
        address = ${address || ''}
      WHERE id = ${userId}
      RETURNING id, name, email, phone, vehicle_number, vehicle_type, address, created_at
    ` as User[];

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export default router;