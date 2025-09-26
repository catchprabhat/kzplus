import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingApi, ApiBooking } from '../services/api';

const convertApiBooking = (apiBooking: ApiBooking): Booking => ({
  ...apiBooking,
  pickupDate: new Date(apiBooking.pickupDate),
  dropDate: new Date(apiBooking.dropDate),
  createdAt: new Date(apiBooking.createdAt)
});

export const useCalendarBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use getBookings() instead of getAllBookings() - this fetches all bookings for calendar view
      const apiBookings = await bookingApi.getBookings();
      const convertedBookings = apiBookings
        .map(convertApiBooking)
        .filter(booking => booking.status !== 'deleted'); // Filter out deleted bookings
      setBookings(convertedBookings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching calendar bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: fetchAllBookings
  };
};