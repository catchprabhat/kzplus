import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { authenticateUser } from '../middleware/userAuth';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

// Update service booking status (admin only)
// Around line 220-280, replace the PUT route with this enhanced version
router.put('/service-bookings/:id/status', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    console.log('=== STATUS UPDATE REQUEST ===');
    console.log('Request params:', { id, status });
    console.log('User info:', { userId: user.id, email: user.email, phone: user.phone });
    console.log('Request body:', req.body);

    // Check if user is the specific admin
    if (user.email !== 'catchprabhat@gmail.com') {
      console.log('❌ Access denied - user is not the authorized admin');
      console.log('User email:', user.email, 'Required:', 'catchprabhat@gmail.com');
      return res.status(403).json({ error: 'Admin access required. Only authorized admin can update booking status.' });
    }

    console.log('✅ Admin access verified for:', user.email);

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status, 'Valid statuses:', validStatuses);
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    console.log('✅ Status validation passed');

    // Check if booking exists
    console.log('🔍 Checking if booking exists...');
    const existingBooking = await sql`SELECT * FROM service_bookings WHERE id = ${id}` as any[];
    
    console.log('Existing booking query result:', existingBooking);
    
    if (existingBooking.length === 0) {
      console.log('❌ Booking not found:', id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('✅ Booking found:', existingBooking[0]);
    console.log('Current status:', existingBooking[0].status);

    // Update booking status
    console.log('🔄 Attempting to update booking status...');
    console.log('Update query params:', { id, status });
    
    const result = await sql`
      UPDATE service_bookings 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    ` as any[];
    
    console.log('✅ Update query executed successfully');
    console.log('Update result:', result);
    console.log('Updated booking:', result[0]);

    if (result.length === 0) {
      console.log('❌ No rows updated - booking not found during update');
      return res.status(404).json({ error: 'Failed to update booking - booking not found' });
    }

    console.log('✅ Status update successful!');
    console.log('=== END STATUS UPDATE ===');

    res.status(200).json({ 
      message: 'Booking status updated successfully',
      booking: result[0],
      debug: {
        oldStatus: existingBooking[0].status,
        newStatus: result[0].status,
        updatedAt: result[0].updated_at
      }
    });
  } catch (error) {
    console.error('💥 ERROR in status update:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Request details:', {
      params: req.params,
      body: req.body,
      method: req.method,
      url: req.url
    });
    
    res.status(500).json({ 
      error: 'Failed to update booking status',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: process.env.NODE_ENV === 'development' ? {
        bookingId: req.params.id,
        requestedStatus: req.body.status,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    });
  }
});

// Delete service booking
router.delete('/service-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userEmail = decoded.email;

    // Find user
    const users = await sql`SELECT * FROM users WHERE email = ${userEmail}` as any[];
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is admin or owns the booking
    const isAdmin = user.email === 'catchprabhat@gmail.com';
    
    if (!isAdmin) {
      // Regular users can only delete their own bookings
      const bookings = await sql`
        SELECT * FROM service_bookings 
        WHERE id = ${id} AND user_id = ${user.id}
      ` as any[];
      
      if (bookings.length === 0) {
        return res.status(403).json({ error: 'You can only delete your own bookings' });
      }
    }

    // Delete the booking
    await sql`DELETE FROM service_bookings WHERE id = ${id}`;

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting service booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;