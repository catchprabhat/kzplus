import { useState, useEffect } from 'react';
import { ServiceBooking } from '../types';
import { notificationService } from '../services/notificationService';

// Enhanced mock service booking data with more realistic examples
const mockServiceBookings: ServiceBooking[] = [
  {
    id: 'service-1',
    vehicleNumber: 'ABC123',
    vehicleName: 'Honda Civic',
    vehicleType: 'Sedan',
    customerName: 'Guest',
    customerPhone: '+1-555-0123',
    customerEmail: 'john@example.com',
    services: [
      {
        id: 'wash-premium',
        name: 'Premium Car Wash',
        description: 'Complete exterior and interior cleaning with wax application',
        price: 45,
        duration: '2 hours',
        category: 'cleaning',
        icon: 'sparkles'
      },
      {
        id: 'ac-cleaning',
        name: 'AC Vent Cleaning',
        description: 'Deep cleaning of AC vents and air filter replacement',
        price: 35,
        duration: '45 minutes',
        category: 'maintenance',
        icon: 'wind'
      }
    ],
    totalPrice: 80,
    scheduledDate: new Date(2025, 0, 20, 10, 0),
    scheduledTime: '10:00',
    status: 'confirmed',
    notes: 'Please focus on interior cleaning',
    createdAt: new Date(2025, 0, 10)
  },
  {
    id: 'service-2',
    vehicleNumber: 'XYZ789',
    vehicleName: 'Toyota Camry',
    vehicleType: 'Sedan',
    customerName: 'Sarah Wilson',
    customerPhone: '+1-555-0456',
    customerEmail: 'sarah@example.com',
    services: [
      {
        id: 'oil-change',
        name: 'Oil Change',
        description: 'Engine oil and filter replacement with quality check',
        price: 55,
        duration: '30 minutes',
        category: 'maintenance',
        icon: 'droplet'
      },
      {
        id: 'brake-service',
        name: 'Brake Service',
        description: 'Brake pad inspection and replacement if needed',
        price: 120,
        duration: '2 hours',
        category: 'maintenance',
        icon: 'disc'
      }
    ],
    totalPrice: 175,
    scheduledDate: new Date(2025, 0, 22, 14, 0),
    scheduledTime: '14:00',
    status: 'in-progress',
    notes: 'Customer mentioned squeaking noise from front brakes',
    createdAt: new Date(2025, 0, 12)
  },
  {
    id: 'service-3',
    vehicleNumber: 'DEF456',
    vehicleName: 'BMW X5',
    vehicleType: 'SUV',
    customerName: 'Mike Johnson',
    customerPhone: '+1-555-0789',
    customerEmail: 'mike@example.com',
    services: [
      {
        id: 'ceramic-coating',
        name: 'Ceramic Coating',
        description: 'Professional ceramic coating for long-lasting paint protection',
        price: 299,
        duration: '1 day',
        category: 'enhancement',
        icon: 'shield'
      }
    ],
    totalPrice: 299,
    scheduledDate: new Date(2025, 0, 25, 9, 0),
    scheduledTime: '09:00',
    status: 'pending',
    notes: 'Vehicle needs to be dropped off early morning',
    createdAt: new Date(2025, 0, 15)
  },
  {
    id: 'service-4',
    vehicleNumber: 'GHI789',
    vehicleName: 'Tesla Model 3',
    vehicleType: 'Electric',
    customerName: 'Emily Chen',
    customerPhone: '+1-555-0321',
    customerEmail: 'emily@example.com',
    services: [
      {
        id: 'wash-basic',
        name: 'Basic Car Wash',
        description: 'Exterior wash with soap and water, interior vacuum cleaning',
        price: 25,
        duration: '1 hour',
        category: 'cleaning',
        icon: 'droplets'
      },
      {
        id: 'polishing',
        name: 'Car Polishing',
        description: 'Professional polishing to restore paint shine and remove scratches',
        price: 89,
        duration: '3 hours',
        category: 'enhancement',
        icon: 'star'
      }
    ],
    totalPrice: 114,
    scheduledDate: new Date(2025, 0, 18, 11, 0),
    scheduledTime: '11:00',
    status: 'completed',
    notes: 'Customer very satisfied with the service',
    createdAt: new Date(2025, 0, 8)
  },
  {
    id: 'service-5',
    vehicleNumber: 'JKL012',
    vehicleName: 'Ford Mustang',
    vehicleType: 'Sports',
    customerName: 'Alex Rodriguez',
    customerPhone: '+1-555-0654',
    customerEmail: 'alex@example.com',
    services: [
      {
        id: 'engine-diagnostic',
        name: 'Engine Diagnostic',
        description: 'Complete engine diagnostic scan and report',
        price: 75,
        duration: '1 hour',
        category: 'repair',
        icon: 'search'
      },
      {
        id: 'battery-service',
        name: 'Battery Service',
        description: 'Battery testing and replacement if required',
        price: 95,
        duration: '45 minutes',
        category: 'repair',
        icon: 'battery'
      }
    ],
    totalPrice: 170,
    scheduledDate: new Date(2025, 0, 16, 13, 0),
    scheduledTime: '13:00',
    status: 'cancelled',
    notes: 'Customer rescheduled for next week',
    createdAt: new Date(2025, 0, 5)
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useServiceBookings = () => {
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service bookings from API
  const fetchServiceBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      await delay(500);
      
      // Sort bookings by creation date (newest first)
      const sortedBookings = [...mockServiceBookings].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setServiceBookings(sortedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service bookings');
    } finally {
      setLoading(false);
    }
  };

  // Create a new service booking
  const createServiceBooking = async (booking: ServiceBooking): Promise<ServiceBooking> => {
    try {
      setError(null);
      await delay(800);
      
      const newBooking = {
        ...booking,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      // Add to mock data (in real app, this would be an API call)
      mockServiceBookings.unshift(newBooking);
      setServiceBookings(prev => [newBooking, ...prev]);
      
      // Send notifications after successful service booking creation
      try {
        await notificationService.sendServiceBookingConfirmation(newBooking);
        console.log('✅ Service booking notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ Service booking created but notifications failed:', notificationError);
        // Don't throw error here - booking was successful, just notifications failed
      }
      
      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update service booking status
  const updateServiceBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled') => {
    try {
      setError(null);
      await delay(300);
      
      // Find and update in mock data
      const bookingIndex = mockServiceBookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) throw new Error('Service booking not found');
      
      mockServiceBookings[bookingIndex].status = status;
      const updatedBooking = mockServiceBookings[bookingIndex];
      
      setServiceBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));
      
      // Send notification for status updates (optional)
      if (status === 'confirmed') {
        try {
          await notificationService.sendServiceBookingConfirmation(updatedBooking);
          console.log('✅ Service booking status update notifications sent successfully');
        } catch (notificationError) {
          console.warn('⚠️ Status updated but notifications failed:', notificationError);
        }
      }
      
      return updatedBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update service booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a service booking
  const deleteServiceBooking = async (id: string) => {
    try {
      setError(null);
      await delay(300);
      
      // Remove from mock data
      const bookingIndex = mockServiceBookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) throw new Error('Service booking not found');
      
      mockServiceBookings.splice(bookingIndex, 1);
      setServiceBookings(prev => prev.filter(booking => booking.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load service bookings on mount
  useEffect(() => {
    fetchServiceBookings();
  }, []);

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