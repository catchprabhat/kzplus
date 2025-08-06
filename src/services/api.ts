// Mock API service - replace with your actual API endpoints
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
      const response = await sql`SELECT * FROM CarBookings`
      
      // For demo purposes, return mock data
      // Replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/bookings`);
      // if (!response.ok) throw new Error('Failed to fetch bookings');
      return await response.json();
      console.log(booking);
      return booking as ApiBooking[];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
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
      await delay(300);
      
      // For demo purposes, remove from mock data
      // Replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete booking');

      const bookingIndex = mockBookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) throw new Error('Booking not found');
      
      mockBookings.splice(bookingIndex, 1);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  }
};

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api' 
  : 'http://localhost:5000/api';

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
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
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