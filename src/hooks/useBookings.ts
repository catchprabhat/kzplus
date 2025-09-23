import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingApi, ApiBooking } from '../services/api';
import { notificationService } from '../services/notificationService';
import { useAuth } from './useAuth'; // Add this import

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
  const { isAuthenticated, getAuthToken, user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email === 'catchprabhat@gmail.com';

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let apiBookings;
      
      // If user is authenticated, fetch bookings based on user type
      if (isAuthenticated) {
        const token = getAuthToken();
        if (token) {
          // Admin sees all bookings, regular users see only their bookings
          if (isAdmin) {
            apiBookings = await bookingApi.getBookings();
          } else {
            apiBookings = await bookingApi.getUserBookings(token);
          }
        } else {
          // Fallback to all bookings if token is missing
          apiBookings = await bookingApi.getBookings();
        }
      } else {
        // Fetch all bookings if not authenticated (for admin view)
        apiBookings = await bookingApi.getBookings();
      }
      
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
      
      // Optimistically update the local state first
      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));
      
      // Then make the API call
      const updatedApiBooking = await bookingApi.updateBookingStatus(id, status);
      const updatedBooking = convertApiBooking(updatedApiBooking);
      
      // Update with the actual response from server
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
      // Revert the optimistic update on error
      const originalBookings = await fetchBookings();
      
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

  // Load bookings on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      // Clear bookings immediately when user changes to prevent showing stale data
      setBookings([]);
      setLoading(true);
      fetchBookings();
    } else {
      // Clear bookings when user logs out
      setBookings([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.email]); // Keep user?.email in dependencies to refetch when user changes

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