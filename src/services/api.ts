// Mock API service - replace with your actual API endpoints
// Remove this entire mock data array:
// const mockBookings: ApiBooking[] = [ ... ];
const NETLIFY_DATABASE_URL='postgresql://neondb_owner:npg_c2IJw9LjlbpE@ep-cold-lab-a56reurn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'; 
import { neon } from '@netlify/neon';
const sql = neon(NETLIFY_DATABASE_URL); // automatically uses env NETLIFY_DATABASE_URL
export interface ApiBooking {
  id: string;
  carId: string;
  carName: string;
  carType: string;
  carSeats: number;
  pickupDate: string; // ISO string
  dropDate: string; // ISO string
  totalDays: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string; // ISO string
}

// Mock data for demonstration - remove when connecting to real API
const mockBookings: ApiBooking[] = [
  {
    id: "car-01",
    carId: '1',
    carName: 'Tesla Model 3',
    carType: 'Electric',
    carSeats: 5,
    pickupDate: new Date(2025, 0, 15, 10, 0).toISOString(),
    dropDate: new Date(2025, 0, 18, 14, 0).toISOString(),
    totalDays: 4,
    totalPrice: 356,
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '+1-555-0123',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: "car-02",
    carId: '2',
    carName: 'BMW X5',
    carType: 'SUV',
    carSeats: 7,
    pickupDate: new Date(2025, 0, 20, 9, 0).toISOString(),
    dropDate: new Date(2025, 0, 22, 18, 0).toISOString(),
    totalDays: 3,
    totalPrice: 285,
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1-555-0456',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: "car-03",
    carId: '3',
    carName: 'Audi A4',
    carType: 'Sedan',
    carSeats: 5,
    pickupDate: new Date(2025, 0, 25, 11, 30).toISOString(),
    dropDate: new Date(2025, 0, 27, 16, 0).toISOString(),
    totalDays: 3,
    totalPrice: 225,
    customerName: 'Mike Davis',
    customerEmail: 'mike@example.com',
    customerPhone: '+1-555-0789',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const bookingApi = {
  // Fetch all bookings
  async getBookings(): Promise<ApiBooking[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/car-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookings = await response.json();
      console.log('Raw bookings from API:', bookings);
      
      // Map the database field names to the API field names
      const mappedBookings = bookings.map((booking: any) => ({
        id: booking.id.toString(),
        carId: booking.car_id,
        carName: booking.car_name,
        carType: booking.car_type,
        carSeats: booking.car_seats || 0,
        pickupDate: booking.pickup_date,
        dropDate: booking.drop_date,
        totalDays: booking.total_days,
        totalPrice: booking.total_price,
        customerName: booking.user_name,
        customerEmail: booking.user_email,
        customerPhone: booking.user_phone,
        status: booking.status,
        createdAt: booking.created_at
      }));
      
      console.log('Mapped bookings:', mappedBookings);
      return mappedBookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  },

  // Fetch user-specific bookings
  async getUserBookings(token: string): Promise<ApiBooking[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/car-bookings/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user bookings');
      }

      const data = await response.json();
      
      // Extract bookings array from the response object
      const bookings = data.bookings || [];
      
      // Map the database field names to the API field names
      const mappedBookings = bookings.map((booking: any) => ({
        id: booking.id.toString(),
        carId: booking.car_id,
        carName: booking.car_name,
        carType: booking.car_type,
        carSeats: booking.car_seats || 0,
        pickupDate: booking.pickup_date,
        dropDate: booking.drop_date,
        totalDays: booking.total_days,
        totalPrice: booking.total_price,
        customerName: booking.user_name,
        customerEmail: booking.user_email,
        customerPhone: booking.user_phone,
        status: booking.status,
        createdAt: booking.created_at
      }));
      
      return mappedBookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch user bookings');
    }
  },

  // Create a new booking
  // Create booking
  async createBooking(booking: Omit<ApiBooking, 'id' | 'createdAt'>): Promise<ApiBooking> {
    try {
      const response = await fetch(`${API_BASE_URL}/car-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: booking.customerName,
          userEmail: booking.customerEmail,
          userPhone: booking.customerPhone,
          carId: booking.carId,
          carName: booking.carName,
          carType: booking.carType,
          pickupLocation: 'Default Location', // Add appropriate pickup location
          pickupDate: booking.pickupDate,
          dropDate: booking.dropDate,
          totalHours: booking.totalDays * 24, // Convert days to hours
          totalDays: booking.totalDays,
          totalPrice: booking.totalPrice,
          deliveryPickup: false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create booking: ${response.statusText}`);
      }
      
      const createdBooking = await response.json();
      
      // Transform backend response to match frontend interface
      return {
        id: createdBooking.id.toString(),
        carId: createdBooking.car_id,
        carName: createdBooking.car_name,
        carType: createdBooking.car_type,
        carSeats: createdBooking.car_seats || 5,
        pickupDate: createdBooking.pickup_date,
        dropDate: createdBooking.drop_date,
        totalDays: createdBooking.total_days,
        totalPrice: createdBooking.total_price,
        customerName: createdBooking.user_name,
        customerEmail: createdBooking.user_email,
        customerPhone: createdBooking.user_phone,
        status: createdBooking.status,
        createdAt: createdBooking.created_at
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<ApiBooking> {
    try {
      const token = localStorage.getItem('driveEasyToken');
      
      if (!token) {
        throw new Error('Authentication required. Please log in as admin.');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
  
      // Make sure this uses PUT method
      const response = await fetch(`${API_BASE_URL}/car-bookings/${id}/status`, {
        method: 'PUT',  // Should be PUT, not PATCH
        headers,
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Admin access required.');
        }
        throw new Error(errorData.error || `Failed to update booking: ${response.statusText}`);
      }
      
      const updatedBooking = await response.json();
      
      // Transform backend response to match frontend interface
      return {
        id: updatedBooking.id,
        carId: updatedBooking.car_id,
        carName: updatedBooking.car_name,
        carType: updatedBooking.car_type,
        carSeats: updatedBooking.car_seats || 5,
        pickupDate: updatedBooking.pickup_date,
        dropDate: updatedBooking.drop_date,
        totalDays: updatedBooking.total_days,
        totalPrice: updatedBooking.total_price,
        customerName: updatedBooking.user_name,
        customerEmail: updatedBooking.user_email,
        customerPhone: updatedBooking.user_phone,
        status: updatedBooking.status,
        createdAt: updatedBooking.created_at
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Delete a booking
  // Delete a booking
  async deleteBooking(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('driveEasyToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('Attempting to delete booking:', id);
      
      const response = await fetch(`${API_BASE_URL}/car-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete booking error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to delete booking' };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete booking`);
      }
      
      const responseText = await response.text();
      console.log('Delete booking success:', responseText);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
};

// Configure API base URL to work in both environments
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'  // Local development
    : 'https://api.kzplusautocare.in/api'  // Production backend with custom domain
);

// Export it so other components can use it
export { API_BASE_URL };

export const apiService = {
  // User registration
  async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleType: string;
    model?: string;
    year?: number;
    color?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  },

  // Search vehicle by number
  async searchVehicleByNumber(vehicleNumber: string) {
    const response = await fetch(`${API_BASE_URL}/vehicles/search/${vehicleNumber}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  },

  // Search user by phone
  async searchUserByPhone(phone: string) {
    const response = await fetch(`${API_BASE_URL}/users/search/phone/${phone}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  },

  // Create service booking
  async createServiceBooking(bookingData: {
    userId?: string;
    vehicleId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    scheduledDate: string;
    scheduledTime: string;
    services: any[];
    totalPrice: number;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Booking failed');
    }

    return response.json();
  },

  // Admin login
  async adminLogin(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  // Get admin data (with auth token)
  async getAdminData(token: string) {
    const [users, bookings] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
      fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    ]);

    if (!users.ok || !bookings.ok) {
      throw new Error('Failed to fetch admin data');
    }

    return {
      users: await users.json(),
      bookings: await bookings.json(),
    };
  },
};

// Car booking interfaces
export interface CarBookingData {
  userName: string;
  userEmail: string;
  userPhone: string;
  carId: string;
  carName: string;
  carType: string;
  pickupLocation: string;
  pickupDate: string;
  dropDate: string;
  totalHours: number;
  totalDays: number;
  totalPrice: number;
  deliveryPickup?: boolean;
}

// Create car booking
export const createCarBooking = async (bookingData: CarBookingData) => {
  // Get authentication token
  const token = localStorage.getItem('driveEasyToken');
  
  if (!token) {
    throw new Error('Authentication required. Please log in to make a booking.');
  }

  const response = await fetch(`${API_BASE_URL}/car-bookings/authenticated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }

  return response.json();
};

// Get available cars
export const getAvailableCars = async (pickupDate: string, dropDate: string) => {
  const response = await fetch(
    `${API_BASE_URL}/car-bookings/available-cars?pickupDate=${encodeURIComponent(pickupDate)}&dropDate=${encodeURIComponent(dropDate)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch available cars');
  }

  return response.json();
};

import { ServiceBooking } from '../hooks/useServiceBookings';

export const serviceBookingApi = {
  // Get user-specific service bookings
  getUserBookings: async (): Promise<ServiceBooking[]> => {
    const token = localStorage.getItem('driveEasyToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Fetching service bookings with token:', token ? 'Token exists' : 'No token');

    const response = await fetch(`${API_BASE_URL}/bookings/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // If unauthorized, clear the token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('driveEasyToken');
        localStorage.removeItem('driveEasyUser');
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(`Failed to fetch service bookings: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Service bookings from API:', data);
    console.log('Number of service bookings:', Array.isArray(data) ? data.length : 0);
    return data;
  },

  // Create service booking
  createBooking: async (bookingData: any): Promise<any> => {
    const token = localStorage.getItem('driveEasyToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Creating booking with data:', bookingData);

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create booking error:', response.status, errorText);
      throw new Error(`Failed to create service booking: ${response.status} - ${errorText}`);
    }

    return response.json();
  },  // <- Added missing comma here

  // Update service booking status (admin only)
  // Around line 565, update the updateBookingStatus function
  // Update service booking status - FIXED
  updateBookingStatus: async (id: string, status: string): Promise<ServiceBooking> => {
    try {
      const url = `${API_BASE_URL}/bookings/service-bookings/${id}/status`;
      console.log('🔄 Making status update request to:', url);
      console.log('📊 Request payload:', { status });
      
      const token = localStorage.getItem('driveEasyToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Status update successful:', result);
      return result;
    } catch (fetchError) {
      console.error('💥 Fetch error:', fetchError);
      throw fetchError;
    }
  },

  // Delete service booking - FIXED
  deleteBooking: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('driveEasyToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      console.log('🗑️ Attempting to delete booking:', id);
      console.log('🔑 Using token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/bookings/service-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response ok:', response.ok);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('✅ Delete booking success:', result);
      return result;
    } catch (error) {
      console.error('💥 Delete booking network error:', error);
      throw error;
    }
  },
};
