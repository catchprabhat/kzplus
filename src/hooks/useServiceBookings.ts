import { useState, useEffect } from 'react';
import { serviceBookingApi } from '../services/api';
import { useAuth } from './useAuth';
import { ServiceBooking } from '../types';

// Remove the duplicate interface since we're using the one from types

export const useServiceBookings = () => {
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchServiceBookings = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, clearing service bookings');
      setServiceBookings([]);
      return;
    }

    if (!user) {
      console.log('No user data available');
      setServiceBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching service bookings for user:', user.email);
      
      const data = await serviceBookingApi.getUserBookings();
      console.log('Raw data from API:', data);
      
      // Ensure data is an array
      const bookingsArray = Array.isArray(data) ? data : [];
      
      // Backend now returns already transformed data, just convert dates
      const transformedBookings: ServiceBooking[] = bookingsArray.map((booking: any) => ({
        id: booking.id.toString(),
        vehicleNumber: booking.vehicleNumber || booking.vehicle_number || 'N/A',
        vehicleType: booking.vehicleType || booking.vehicle_type || 'N/A',
        vehicleName: booking.vehicleName || booking.vehicleType || booking.vehicle_type || 'N/A',
        customerName: booking.customerName || booking.name || 'N/A',
        customerPhone: booking.customerPhone || booking.phone || 'N/A',
        customerEmail: booking.customerEmail || booking.email || 'N/A',
        services: Array.isArray(booking.services) ? booking.services : 
                  (typeof booking.services === 'string' ? JSON.parse(booking.services) : []),
        totalPrice: booking.totalPrice || booking.total_price || 0,
        scheduledDate: new Date(booking.scheduledDate || booking.scheduled_date),
        scheduledTime: booking.scheduledTime || booking.scheduled_time,
        status: booking.status || 'pending',
        notes: booking.notes || '',
        createdAt: new Date(booking.createdAt || booking.created_at)
      }));
      
      console.log('Frontend transformed bookings:', transformedBookings);
      console.log('Number of bookings before deduplication:', transformedBookings.length);
      
      // Enhanced deduplication - remove duplicates based on multiple criteria
      const uniqueBookings = transformedBookings.reduce((acc: ServiceBooking[], current) => {
        const existingIndex = acc.findIndex(booking => 
          booking.id === current.id || 
          (
            booking.customerEmail === current.customerEmail &&
            booking.scheduledDate.getTime() === current.scheduledDate.getTime() &&
            booking.scheduledTime === current.scheduledTime &&
            booking.totalPrice === current.totalPrice
          )
        );
        
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Keep the one with the higher ID (more recent)
          if (parseInt(current.id) > parseInt(acc[existingIndex].id)) {
            acc[existingIndex] = current;
          }
        }
        
        return acc;
      }, []);
      
      console.log('Number of bookings after deduplication:', uniqueBookings.length);
      
      // Only update state if the data has actually changed
      setServiceBookings(prevBookings => {
        const hasChanged = prevBookings.length !== uniqueBookings.length ||
          !prevBookings.every((prev, index) => {
            const current = uniqueBookings[index];
            return current && prev.id === current.id && prev.status === current.status;
          });
        
        if (hasChanged) {
          console.log('Service bookings updated:', uniqueBookings);
          return uniqueBookings;
        }
        
        console.log('No changes detected, keeping existing bookings');
        return prevBookings;
      });
    } catch (err: any) {
      console.error('Error fetching service bookings:', err);
      console.error('Error response:', err.response?.data);
      setError(err.message || 'Failed to fetch service bookings');
      setServiceBookings([]);
      
      // If it's an authentication error, you might want to handle it differently
      if (err.response?.status === 401) {
        console.log('Authentication failed, user needs to login again');
        // Optionally clear auth data
        localStorage.removeItem('driveEasyToken');
        localStorage.removeItem('driveEasyUser');
      }
    } finally {
      setLoading(false);
    }
  };

  const createServiceBooking = async (bookingData: any) => {
    try {
      const result = await serviceBookingApi.createBooking(bookingData);
      
      // Instead of refetching, add the new booking directly to state
      if (result && result.id) {
        const newBooking: ServiceBooking = {
          id: result.id.toString(),
          vehicleNumber: result.vehicleNumber || 'N/A',
          vehicleType: result.vehicleType || 'N/A',
          vehicleName: result.vehicleName || result.vehicleType || 'N/A',
          customerName: result.customerName || 'N/A',
          customerPhone: result.customerPhone || 'N/A',
          customerEmail: result.customerEmail || 'N/A',
          services: Array.isArray(result.services) ? result.services : [],
          totalPrice: result.totalPrice || 0,
          scheduledDate: new Date(result.scheduledDate),
          scheduledTime: result.scheduledTime,
          status: result.status || 'pending',
          notes: result.notes || '',
          createdAt: new Date(result.createdAt || new Date())
        };
        
        // Add to state only if it doesn't already exist
        setServiceBookings(prev => {
          const exists = prev.some(booking => booking.id === newBooking.id);
          if (!exists) {
            console.log('Adding new booking to state:', newBooking);
            return [newBooking, ...prev];
          }
          console.log('Booking already exists in state, not adding duplicate');
          return prev;
        });
      } else {
        // Fallback to refetching if result doesn't contain expected data
        setTimeout(async () => {
          await fetchServiceBookings();
        }, 1000);
      }
      
      return result;
    } catch (err) {
      console.error('Error creating service booking:', err);
      throw err;
    }
  };

  const updateServiceBookingStatus = async (id: string, status: string) => {
    try {
      await serviceBookingApi.updateBookingStatus(id, status);
      await fetchServiceBookings(); // Refresh the list
    } catch (error) {
      console.error('Error updating service booking status:', error);
      throw error;
    }
  };

  const deleteServiceBooking = async (id: string) => {
    try {
      await serviceBookingApi.deleteBooking(id);
      await fetchServiceBookings(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service booking:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Clear service bookings immediately when user changes to prevent showing stale data
      setServiceBookings([]);
      setLoading(true);
      fetchServiceBookings();
    } else {
      // Clear service bookings when user logs out
      setServiceBookings([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.email]); // Add user?.email dependency to refetch when user changes
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