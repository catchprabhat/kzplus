// Mock API service - replace with your actual API endpoints
// Remove these lines:
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
  async createBooking(booking: Omit<ApiBooking, 'id' | 'createdAt'>): Promise<ApiBooking> {
    try {
      await delay(800); // Simulate network delay
      
      const newBooking: ApiBooking = {
        ...booking,
        id: "car-04",
        createdAt: new Date().toISOString()
      };

      // For demo purposes, add to mock data
      // Replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/bookings`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(booking),
      // });
      // if (!response.ok) throw new Error('Failed to create booking');
      // return await response.json();

      mockBookings.unshift(newBooking);
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<ApiBooking> {
    try {
      await delay(300);
      
      // For demo purposes, update mock data
      // Replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ status }),
      // });
      // if (!response.ok) throw new Error('Failed to update booking');
      // return await response.json();

      const bookingIndex = mockBookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) throw new Error('Booking not found');
      
      mockBookings[bookingIndex].status = status;
      return mockBookings[bookingIndex];
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  },

  // Delete a booking
  async deleteBooking(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/car-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
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

    const response = await fetch(`${API_BASE_URL}/bookings/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to fetch service bookings: ${response.status}`);
    }

    const data = await response.json();
    console.log('Service bookings from API:', data);
    return data;
  },

  // Create service booking
  createBooking: async (bookingData: any): Promise<any> => {
    const token = localStorage.getItem('driveEasyToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error('Failed to create service booking');
    }

    return response.json();
  }
};