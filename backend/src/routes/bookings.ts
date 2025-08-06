import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

interface ServiceBooking {
  id: number;
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  total_price: number;
  status: string;
  notes: string;
  created_at: string;
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

      // Insert into service_bookings
      const bookingResult = await sql`
        INSERT INTO service_bookings (service_id, scheduled_date, scheduled_time, total_price, notes)
        VALUES (${userId}, ${scheduledDate}, ${scheduledTime}, ${totalPrice}, ${notes || ''})
        RETURNING *;
      ` as ServiceBooking[];

      if (!bookingResult[0]) {
        throw new Error('Failed to create booking');
      }

      const booking = bookingResult[0];

      // Insert each service into booking_services
      for (const service of services) {
        await sql`
          INSERT INTO booking_services (booking_id, service_id, service_name, service_price)
          VALUES (${booking.id}, ${service.id}, ${service.name}, ${service.price})
          RETURNING id;
        `;
      }

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
      const result = await sql`
        SELECT sb.*, 
               ARRAY_AGG(
                 JSON_BUILD_OBJECT(
                   'name', bs.service_name,
                   'price', bs.service_price
                 )
               ) as services
        FROM service_bookings sb
        LEFT JOIN booking_services bs ON sb.id = bs.booking_id
        GROUP BY sb.id
        ORDER BY sb.created_at DESC
      ` as (ServiceBooking & { services: { name: string; price: number }[] })[];

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;