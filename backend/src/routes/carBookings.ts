import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { emailService } from '../services/emailService';
import { authenticateUser } from '../middleware/userAuth';

const router = express.Router();

// Create a new car booking (WITHOUT authentication - original endpoint)
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
    deliveryPickup = false
  } = req.body;

  // Validate required fields
  if (!userName || !userEmail || !userPhone || !carId || !carName || !pickupDate || !dropDate) {
    return res.status(400).json({ 
      error: 'Missing required fields: userName, userEmail, userPhone, carId, carName, pickupDate, dropDate' 
    });
  }

  try {
    // Check for conflicting bookings using template literal syntax
    const conflictResult = await sql`
      SELECT id FROM car_bookings 
      WHERE car_id = ${carId} 
      AND status != 'cancelled'
      AND (
        (pickup_date <= ${pickupDate} AND drop_date > ${pickupDate}) OR
        (pickup_date < ${dropDate} AND drop_date >= ${dropDate}) OR
        (pickup_date >= ${pickupDate} AND drop_date <= ${dropDate})
      )
    ` as any[];
    
    if (conflictResult.length > 0) {
      return res.status(409).json({ 
        error: 'Car is not available for the selected dates' 
      });
    }

    // Insert new booking using template literal syntax
    // In the regular booking route (around line 62)
    const result = await sql`
      INSERT INTO car_bookings (
        car_id, car_name, car_type, pickup_location, pickup_date, drop_date,
        total_hours, total_days, total_price, user_name, user_email, user_phone,
        delivery_pickup, status, created_at
      ) VALUES (
        ${carId}, ${carName}, ${carType}, ${pickupLocation}, ${pickupDate}, ${dropDate},
        ${totalHours}, ${totalDays}, ${totalPrice}, ${userName}, ${userEmail}, ${userPhone},
        ${deliveryPickup}, 'pending', NOW()
      )
      RETURNING *
    ` as any[];
    
    const booking = result[0];
    
    // Send confirmation email with correct property names
    try {
      await emailService.sendBookingConfirmation({
        userName: userName, // Use userName not customerName
        userEmail: userEmail,
        userPhone: userPhone,
        carName,
        pickupDate: pickupDate,
        dropDate: dropDate,
        totalPrice,
        pickupLocation
      });
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError);
    }
    
    res.status(201).json({
      id: booking.id,
      carId: booking.car_id,
      carName: booking.car_name,
      carType: booking.car_type,
      pickupLocation: booking.pickup_location,
      pickupDate: booking.pickup_date,
      dropDate: booking.drop_date,
      totalHours: booking.total_hours,
      totalDays: booking.total_days,
      totalPrice: booking.total_price,
      userName: booking.user_name,
      userEmail: booking.user_email,
      userPhone: booking.user_phone,
      deliveryPickup: booking.delivery_pickup,
      status: booking.status,
      createdAt: booking.created_at
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get available cars
router.get('/available-cars', async (req: Request, res: Response) => {
  try {
    const { pickupDate, dropDate } = req.query;
    
    if (!pickupDate || !dropDate) {
      return res.status(400).json({ error: 'Pickup date and drop date are required' });
    }

    // Get booked car IDs for the date range using template literal
    const bookedCars = await sql`
      SELECT car_id FROM car_bookings 
      WHERE status != 'cancelled'
      AND (
        (pickup_date <= ${pickupDate as string} AND drop_date > ${pickupDate as string}) OR
        (pickup_date < ${dropDate as string} AND drop_date >= ${dropDate as string}) OR
        (pickup_date >= ${pickupDate as string} AND drop_date <= ${dropDate as string})
      )
    ` as any[];
    
    const bookedCarIds = bookedCars.map((row: any) => row.car_id);
    res.json({ bookedCarIds });
  } catch (error) {
    console.error('Error fetching available cars:', error);
    res.status(500).json({ error: 'Failed to fetch available cars' });
  }
});

// Get all bookings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bookings = await sql`SELECT * FROM car_bookings ORDER BY created_at DESC`;
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get user-specific bookings (authenticated)
router.get('/user', authenticateUser, async (req, res) => {
  try {
    console.log('=== GET /user endpoint called ===');
    console.log('Token user object:', JSON.stringify(req.user, null, 2));
    
    // Extract email from token - DecodedToken only has direct email property
    const userEmail = req.user?.email;
    
    console.log('Extracted email from token:', userEmail);
    
    if (!userEmail) {
      console.error('No email found in token');
      return res.status(400).json({ error: 'User email not found in token' });
    }
    
    // Normalize email for comparison
    const normalizedEmail = userEmail.toLowerCase().trim();
    console.log('Normalized email for query:', normalizedEmail);
    
    // Query with multiple email matching strategies using sql template
    const sqlResult = await sql`
      SELECT * FROM car_bookings 
      WHERE LOWER(TRIM(user_email)) = ${normalizedEmail}
         OR LOWER(TRIM(user_email)) = ${userEmail}
         OR user_email = ${userEmail}
      ORDER BY created_at DESC
    `;
    
    // SQL result is already an array, no need for Array.from()
    const result = sqlResult as any[];
    
    console.log(`Found ${result.length} bookings for user:`, normalizedEmail);
    
    if (result.length > 0) {
      console.log('Sample booking:', JSON.stringify(result[0], null, 2));
    }
    
    // Return the bookings - remove the email service call from here
    res.json({
      bookings: result.map(booking => ({
        id: booking.id,
        car_id: booking.car_id,
        car_name: booking.car_name,
        car_type: booking.car_type,
        car_seats: booking.car_seats || 0,
        pickup_date: booking.pickup_date,
        drop_date: booking.drop_date,
        total_days: booking.total_days,
        total_price: booking.total_price,
        user_name: booking.user_name,
        user_email: booking.user_email,
        user_phone: booking.user_phone,
        status: booking.status,
        created_at: booking.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/:id/status', authenticateUser, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Validate status values
  if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // Check if user is admin (add admin check)
  const userEmail = req.user?.email;
  const adminEmail = process.env.ADMIN_EMAIL || 'catchprabhat@gmail.com';
  
  if (userEmail !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await sql`
      UPDATE car_bookings 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    ` as any[];
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Delete booking
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await sql`
      DELETE FROM car_bookings 
      WHERE id = ${id} 
      RETURNING *
    ` as any[];
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Create authenticated booking
router.post('/authenticated', authenticateUser, async (req, res) => {
  try {
    console.log('=== POST /authenticated endpoint called ===');
    console.log('Token user object:', JSON.stringify(req.user, null, 2));
    
    // Extract and normalize email from token - DecodedToken only has direct email property
    const tokenEmail = req.user?.email;
    
    if (!tokenEmail) {
      console.error('No email found in token for booking creation');
      return res.status(400).json({ error: 'User email not found in token' });
    }
    
    // Normalize email consistently
    const normalizedEmail = tokenEmail.toLowerCase().trim();
    console.log('Original email from token:', tokenEmail);
    console.log('Normalized email for storage:', normalizedEmail);
    
    const {
      carId,
      carName,
      carType,
      pickupLocation,
      pickupDate,
      dropDate,
      totalHours,
      totalDays,
      totalPrice,
      deliveryPickup = false
    } = req.body;

    // Get user info from authenticated token - use email from token
    const userName = req.body.userName || normalizedEmail;
    const userPhone = req.body.userPhone || '';
    
    console.log('=== DEBUGGING BOOKING CREATION ===');
    console.log('Token user object:', JSON.stringify(req.user, null, 2));
    console.log('Raw email from token:', tokenEmail);
    console.log('Email to be stored:', normalizedEmail);
    
    // Validate required fields
    if (!carId || !carName || !pickupDate || !dropDate || !normalizedEmail || normalizedEmail.trim() === '') {
      console.log('ERROR: Missing required fields or invalid email');
      return res.status(400).json({ 
        error: 'Missing required fields: carId, carName, pickupDate, dropDate, and user must be authenticated with valid email' 
      });
    }

    // Check for conflicting bookings using template literal
    const conflictSqlResult = await sql`
      SELECT id FROM car_bookings 
      WHERE car_id = ${carId} 
      AND status != 'cancelled'
      AND (
        (pickup_date <= ${pickupDate} AND drop_date > ${pickupDate}) OR
        (pickup_date < ${dropDate} AND drop_date >= ${dropDate}) OR
        (pickup_date >= ${pickupDate} AND drop_date <= ${dropDate})
      )
    `;
    
    // SQL result is already an array, no need for Array.from()
    const conflictResult = conflictSqlResult as any[];
    
    if (conflictResult.length > 0) {
      return res.status(409).json({ 
        error: 'Car is not available for the selected dates' 
      });
    }

    // Insert booking with normalized email using sql template
    const sqlResult = await sql`
      INSERT INTO car_bookings (
        user_name, user_email, user_phone, car_id, car_name, car_type, 
        pickup_location, pickup_date, drop_date, total_hours, total_days, 
        total_price, delivery_pickup, status, created_at
      ) VALUES (
        ${userName}, ${normalizedEmail}, ${userPhone}, ${carId}, ${carName}, ${carType},
        ${pickupLocation || 'Bangalore'}, ${pickupDate}, ${dropDate}, ${totalHours}, ${totalDays},
        ${totalPrice}, ${deliveryPickup || false}, 'pending', ${new Date()}
      )
      RETURNING *
    `;
    
    // SQL result is already an array, no need for Array.from()
    const result = sqlResult as any[];
    
    console.log('Storing booking with email:', normalizedEmail);
    console.log('Booking created successfully:', result[0]);

    // Send confirmation email with all required parameters
    try {
      await emailService.sendBookingConfirmation({
        userEmail: normalizedEmail,
        userName: userName,
        userPhone: userPhone,
        carName: carName,
        pickupDate: pickupDate,
        dropDate: dropDate,
        totalPrice: totalPrice,
        pickupLocation: pickupLocation || 'Bangalore'
      });
      console.log('Booking confirmation email sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: result[0].id,
        carName: result[0].car_name,
        pickupDate: result[0].pickup_date,
        dropDate: result[0].drop_date,
        totalPrice: result[0].total_price,
        status: result[0].status,
        userEmail: result[0].user_email
      }
    });
  } catch (error) {
    console.error('Error creating authenticated booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export default router;