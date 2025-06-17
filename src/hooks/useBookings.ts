import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingApi, ApiBooking } from '../services/api';
import { notificationService } from '../services/notificationService';

// Convert API booking to internal booking format
const convertApiBooking = (apiBooking: ApiBooking): Booking => ({
  ...apiBooking,
  pickupDate: new Date(apiBooking.pickupDate),
  dropDate: new Date(apiBooking.dropDate),
  createdAt: new Date(apiBooking.createdAt)
});

// Convert internal booking to API format
const convertToApiBooking = (booking: Booking): Omit<ApiBooking, 'id' | 'createdAt'> => ({
  carId: booking.carId,
  carName: booking.carName,
  carType: booking.carType,
  carSeats: booking.carSeats,
  pickupDate: booking.pickupDate.toISOString(),
  dropDate: booking.dropDate.toISOString(),
  totalDays: booking.totalDays,
  totalPrice: booking.totalPrice,
  customerName: booking.customerName,
  customerEmail: booking.customerEmail,
  customerPhone: booking.customerPhone,
  status: booking.status
});

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBookings = await bookingApi.getBookings();
      const convertedBookings = apiBookings.map(convertApiBooking);
      setBookings(convertedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (booking: Booking): Promise<Booking> => {
    try {
      setError(null);
      const apiBookingData = convertToApiBooking(booking);
      const createdApiBooking = await bookingApi.createBooking(apiBookingData);
      const createdBooking = convertApiBooking(createdApiBooking);
      
      setBookings(prev => [createdBooking, ...prev]);
      
      // Send notifications after successful booking creation
      try {
        await notificationService.sendBookingConfirmation(createdBooking);
        console.log('✅ Booking notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ Booking created but notifications failed:', notificationError);
        // Don't throw error here - booking was successful, just notifications failed
      }
      
      return createdBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      setError(null);
      const updatedApiBooking = await bookingApi.updateBookingStatus(id, status);
      const updatedBooking = convertApiBooking(updatedApiBooking);
      
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      
      // Send notification for status updates (optional)
      if (status === 'confirmed') {
        try {
          await notificationService.sendBookingConfirmation(updatedBooking);
          console.log('✅ Status update notifications sent successfully');
        } catch (notificationError) {
          console.warn('⚠️ Status updated but notifications failed:', notificationError);
        }
      }
      
      return updatedBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a booking
  const deleteBooking = async (id: string) => {
    try {
      setError(null);
      await bookingApi.deleteBooking(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    deleteBooking
  };
};