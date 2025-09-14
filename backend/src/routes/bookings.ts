import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { authenticateUser } from '../middleware/userAuth';

const router = express.Router();

interface ServiceBooking {
  id: number;
  user_id: number; // Changed from service_id to user_id
  scheduled_date: string;
  scheduled_time: string;
  total_price: number;
  status: string;
  notes: string;
  created_at: string;
  services: any; // Added services field
}

router.post(
  '/',
  authenticateUser,
  async (req: Request, res: Response) => {
    const {
      scheduledDate,
      scheduledTime,
      services,
      totalPrice,
      notes,
    } = req.body;

    // Validate input
    if (!scheduledDate || !scheduledTime || !services || !Array.isArray(services) || services.length === 0 || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields or invalid services array' });
    }

    // Validate each service
    for (const service of services) {
      if (!service.id || !service.name || !service.price) {
        return res.status(400).json({ error: 'Each service must have id, name, and price' });
      }
    }

    try {
      // Get user information from the authenticated token
      const userEmail = req.user?.email;
      const userPhone = req.user?.phone;
      
      if (!userEmail && !userPhone) {
        return res.status(400).json({ error: 'User identification required' });
      }

      // Find user by email or phone to get user ID
      let user;
      if (userEmail) {
        const users = await sql`SELECT * FROM users WHERE email = ${userEmail}` as any[];
        user = users[0];
      } else if (userPhone) {
        const users = await sql`SELECT * FROM users WHERE phone = ${userPhone}` as any[];
        user = users[0];
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await sql`BEGIN`;

      // Insert into service_bookings matching your exact schema
      const bookingResult = await sql`
        INSERT INTO service_bookings (user_id, scheduled_date, scheduled_time, total_price, status, notes, services)
        VALUES (${user.id}, ${scheduledDate}, ${scheduledTime}, ${totalPrice}, 'pending', ${notes || ''}, ${JSON.stringify(services)})
        RETURNING *;
      ` as ServiceBooking[];

      await sql`COMMIT`;

      res.status(201).json({
        message: 'Service booking created successfully',
        booking: bookingResult[0]
      });
    } catch (error) {
      await sql`ROLLBACK`;
      console.error('Error creating service booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/user',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      const userPhone = req.user?.phone;
      
      if (!userEmail && !userPhone) {
        return res.status(400).json({ error: 'User identification required' });
      }

      // Find user by email or phone
      let user;
      if (userEmail) {
        const users = await sql`SELECT * FROM users WHERE email = ${userEmail}` as any[];
        user = users[0];
      } else if (userPhone) {
        const users = await sql`SELECT * FROM users WHERE phone = ${userPhone}` as any[];
        user = users[0];
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is admin
      const isAdmin = user.email === 'catchprabhat@gmail.com';
      
      let result;
      if (isAdmin) {
        // Admin sees all bookings - match your exact schema
        result = await sql`
          SELECT 
            sb.id,
            sb.user_id,
            sb.scheduled_date,
            sb.scheduled_time,
            sb.total_price,
            sb.status,
            sb.notes,
            sb.created_at,
            sb.services,
            u.name,
            u.email,
            u.phone,
            u.vehicle_number,
            u.vehicle_type
          FROM service_bookings sb
          LEFT JOIN users u ON sb.user_id = u.id
          ORDER BY sb.created_at DESC
        ` as any[];
      } else {
        // Regular user sees only their bookings
        result = await sql`
          SELECT 
            sb.id,
            sb.user_id,
            sb.scheduled_date,
            sb.scheduled_time,
            sb.total_price,
            sb.status,
            sb.notes,
            sb.created_at,
            sb.services,
            u.name,
            u.email,
            u.phone,
            u.vehicle_number,
            u.vehicle_type
          FROM service_bookings sb
          LEFT JOIN users u ON sb.user_id = u.id
          WHERE sb.user_id = ${user.id}
          ORDER BY sb.created_at DESC
        ` as any[];
      }

      // Transform data to match frontend expectations
      const transformedResult = result.map(booking => ({
        id: booking.id,
        vehicleNumber: booking.vehicle_number || 'N/A',
        vehicleType: booking.vehicle_type || 'N/A',
        vehicleName: booking.vehicle_type || 'N/A',
        customerName: booking.name || 'N/A',
        customerPhone: booking.phone || 'N/A',
        customerEmail: booking.email || 'N/A',
        services: typeof booking.services === 'string' ? JSON.parse(booking.services) : booking.services || [],
        totalPrice: booking.total_price || 0,
        scheduledDate: booking.scheduled_date,
        scheduledTime: booking.scheduled_time,
        status: booking.status || 'pending',
        notes: booking.notes || '',
        createdAt: booking.created_at
      }));
      
      console.log('Service bookings found:', transformedResult.length);
      res.status(200).json(transformedResult);
    } catch (error) {
      console.error('Error fetching user service bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;