import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { emailService } from '../services/emailService';

const router = express.Router();

interface CarBooking {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  car_id: string;
  car_name: string;
  car_type: string;
  pickup_location: string;
  pickup_date: string;
  drop_date: string;
  total_hours: number;
  total_days: number;
  total_price: number;
  delivery_pickup: boolean;
  status: string;
  created_at: string;
}

// Create a new car booking
// Inside the POST endpoint
router.post('/', async (req: Request, res: Response) => {
  console.log('Received booking data:', req.body);
  
  const {
    userName,
    userEmail,
    userPhone,
    carId,
    carName,
    carType,
    pickupLocation,
    pickupDate,
    dropDate,
    totalHours,
    totalDays,
    totalPrice,
    deliveryPickup
  } = req.body;

  // Log the extracted data
  console.log('Extracted data:', { 
    userName, userEmail, userPhone, carId, carName, 
    pickupDate, dropDate, totalPrice 
  });

  // Validate required fields
  if (!userName || !userEmail || !userPhone || !carId || !carName || !carType || 
      !pickupLocation || !pickupDate || !dropDate || !totalPrice) {
    console.log('Missing required fields:', { 
      userName, userEmail, userPhone, carId, carName, carType,
      pickupLocation, pickupDate, dropDate, totalPrice 
    });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sql`BEGIN`;
    console.log('Transaction started');

    // Check if car is available for the requested dates
    const conflictingBookings = await sql`
      SELECT id FROM car_bookings 
      WHERE car_id = ${carId} 
      AND status IN ('confirmed', 'pending')
      AND (
        (pickup_date <= ${pickupDate} AND drop_date > ${pickupDate}) OR
        (pickup_date < ${dropDate} AND drop_date >= ${dropDate}) OR
        (pickup_date >= ${pickupDate} AND drop_date <= ${dropDate})
      )
    `;

    // Convert to array and check length
    const conflictingBookingsArray = conflictingBookings as unknown as any[];
    console.log('Conflicting bookings:', conflictingBookingsArray);
    
    if (conflictingBookingsArray.length > 0) {
      await sql`ROLLBACK`;
      console.log('Transaction rolled back due to conflict');
      return res.status(409).json({ error: 'Car is not available for the selected dates' });
    }

    // Log the SQL query parameters
    console.log('Inserting with params:', {
      userName, userEmail, userPhone, carId, carName, carType,
      pickupLocation, pickupDate, dropDate, totalHours, totalDays,
      totalPrice, deliveryPickup: deliveryPickup || false
    });

    // Insert the booking
    const bookingResult = await sql`
      INSERT INTO car_bookings (
        user_name, user_email, user_phone, car_id, car_name, car_type,
        pickup_location, pickup_date, drop_date, total_hours, total_days,
        total_price, delivery_pickup
      ) VALUES (
        ${userName}, ${userEmail}, ${userPhone}, ${carId}, ${carName}, ${carType},
        ${pickupLocation}, ${pickupDate}, ${dropDate}, ${totalHours}, ${totalDays},
        ${totalPrice}, ${deliveryPickup || false}
      ) RETURNING *
    ` as unknown as CarBooking[];

    console.log('Insert result:', bookingResult);
    await sql`COMMIT`;
    console.log('Transaction committed');

    // Send booking confirmation email
    try {
      const emailResult = await emailService.sendBookingConfirmation({
        userEmail,
        userName,
        userPhone,
        carName,
        pickupDate,
        dropDate,
        totalPrice,
        pickupLocation
      });
      
      if (emailResult.success) {
        console.log('Booking confirmation email sent successfully');
      } else {
        console.error('Failed to send booking confirmation email:', emailResult.message);
      }
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the booking if email sending fails
    }

    res.status(201).json({
      message: 'Car booked successfully',
      booking: bookingResult[0]
    });

  } catch (error: unknown) {
    await sql`ROLLBACK`;
    console.error('Error creating car booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
});

// Get available cars for specific dates
router.get('/available-cars', async (req: Request, res: Response) => {
  const { pickupDate, dropDate } = req.query;

  if (!pickupDate || !dropDate) {
    return res.status(400).json({ error: 'Pickup date and drop date are required' });
  }

  try {
    // Get all car IDs that are booked during the requested period
    const bookedCarIds = await sql`
      SELECT DISTINCT car_id FROM car_bookings 
      WHERE status IN ('confirmed', 'pending')
      AND (
        (pickup_date <= ${pickupDate as string} AND drop_date > ${pickupDate as string}) OR
        (pickup_date < ${dropDate as string} AND drop_date >= ${dropDate as string}) OR
        (pickup_date >= ${pickupDate as string} AND drop_date <= ${dropDate as string})
      )
    `;

    // Convert to array before using map
    const bookedCarIdsArray = bookedCarIds as unknown as any[];
    const bookedIds = bookedCarIdsArray.map((booking: any) => booking.car_id);

    res.status(200).json({
      bookedCarIds: bookedIds
    });

  } catch (error) {
    console.error('Error fetching available cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all car bookings (admin)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bookings = await sql`
      SELECT * FROM car_bookings 
      ORDER BY created_at DESC
    ` as unknown as CarBooking[];

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching car bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['confirmed', 'pending', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await sql`
      UPDATE car_bookings 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    ` as unknown as CarBooking[];

    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking: result[0]
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a car booking
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await sql`
      DELETE FROM car_bookings 
      WHERE id = ${id}
      RETURNING *
    ` as unknown as CarBooking[];

    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking deleted successfully',
      booking: result[0]
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;