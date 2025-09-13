import { useState, useEffect } from 'react';
import { serviceBookingApi } from '../services/api';
import { useAuth } from './useAuth';
import { ServiceBooking } from '../types';

// Remove the duplicate interface since we're using the one from types

export const useServiceBookings = () => {
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchServiceBookings = async () => {
    if (!isAuthenticated) {
      setServiceBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching service bookings...');
      const data = await serviceBookingApi.getUserBookings();
      console.log('Raw data from API:', data);
      
      // Backend now returns already transformed data, just convert dates
      const transformedBookings: ServiceBooking[] = data.map((booking: any) => ({
        id: booking.id.toString(),
        vehicleNumber: booking.vehicleNumber || 'N/A',
        vehicleType: booking.vehicleType || 'N/A',
        vehicleName: booking.vehicleName || booking.vehicleType || 'N/A', // Add fallback
        customerName: booking.customerName || 'N/A',
        customerPhone: booking.customerPhone || 'N/A',
        customerEmail: booking.customerEmail || 'N/A',
        services: booking.services || [],
        totalPrice: booking.totalPrice || 0,
        scheduledDate: new Date(booking.scheduledDate),
        scheduledTime: booking.scheduledTime,
        status: booking.status || 'pending',
        notes: booking.notes || '',
        createdAt: new Date(booking.createdAt)
      }));
      
      console.log('Frontend transformed bookings:', transformedBookings);
      console.log('Number of bookings:', transformedBookings.length);
      setServiceBookings(transformedBookings);
    } catch (err: any) {
      console.error('Error fetching service bookings:', err);
      setError(err.message || 'Failed to fetch service bookings');
      setServiceBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const createServiceBooking = async (bookingData: any) => {
    try {
      const result = await serviceBookingApi.createBooking(bookingData);
      await fetchServiceBookings(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Error creating service booking:', err);
      throw err;
    }
  };

  const updateServiceBookingStatus = async (id: string, status: string) => {
    // This would need a backend endpoint for updating status
    console.log('Update service booking status:', id, status);
    await fetchServiceBookings();
  };

  const deleteServiceBooking = async (id: string) => {
    // This would need a backend endpoint for deleting bookings
    console.log('Delete service booking:', id);
    await fetchServiceBookings();
  };

  useEffect(() => {
    fetchServiceBookings();
  }, [isAuthenticated]);

  return {
    serviceBookings,
    loading,
    error,
    fetchServiceBookings,
    createServiceBooking,
    updateServiceBookingStatus,
    deleteServiceBooking
  };
};