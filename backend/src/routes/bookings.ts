import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { authenticateAdmin } from '../middleware/auth';

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
  async (req: Request, res: Response) => {
    const {
      userId,
      scheduledDate,
      scheduledTime,
      services,
      totalPrice,
      notes,
    } = req.body;

    // Validate input
    if (!userId || !scheduledDate || !scheduledTime || !services || !Array.isArray(services) || services.length === 0 || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields or invalid services array' });
    }

    // Validate each service
    for (const service of services) {
      if (!service.id || !service.name || !service.price) {
        return res.status(400).json({ error: 'Each service must have id, name, and price' });
      }
    }

    try {
      await sql`BEGIN`;

      // Insert into service_bookings with user_id and services as JSONB
      const bookingResult = await sql`
        INSERT INTO service_bookings (user_id, scheduled_date, scheduled_time, total_price, notes, services)
        VALUES (${userId}, ${scheduledDate}, ${scheduledTime}, ${totalPrice}, ${notes || ''}, ${JSON.stringify(services)})
        RETURNING *;
      ` as ServiceBooking[];

      if (!bookingResult[0]) {
        throw new Error('Failed to create booking');
      }

      const booking = bookingResult[0];

      // No need to insert into booking_services as that table has been dropped

      await sql`COMMIT`;

      res.status(201).json({ message: 'Service booked successfully', booking: { id: booking.id } });
    } catch (error: unknown) {
      await sql`ROLLBACK`;
      console.error('Error booking service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: 'Internal server error', details: errorMessage });
    }
  }
);

router.get(
  '/',
  authenticateAdmin,
  async (_req: Request, res: Response) => {
    try {
      // Updated query to not join with booking_services
      const result = await sql`
        SELECT sb.*
        FROM service_bookings sb
        ORDER BY sb.created_at DESC
      ` as ServiceBooking[];

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;