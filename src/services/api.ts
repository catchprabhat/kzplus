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
import { databaseService, User, Vehicle, ServiceBooking } from './database';
import { authService, LoginResponse } from './authService';

export interface UserRegistrationData {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  // Vehicle Info
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  vehicleType?: string;
}

export interface VehicleSearchResult {
  user: User;
  vehicle: Vehicle;
}

export interface ServiceBookingData {
  userId: number;
  vehicleId: number;
  serviceId: number;
  bookingDate: string;
  preferredTime?: string;
  totalAmount?: number;
  customerNotes?: string;
}

export class ApiService {
  // User Registration
  async registerUser(data: UserRegistrationData): Promise<{ user: User; vehicle: Vehicle }> {
    try {
      // Create user
      const user = await databaseService.createUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode
      });

      // Create vehicle
      const vehicle = await databaseService.createVehicle({
        user_id: user.id!,
        vehicle_number: data.vehicleNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        vehicle_type: data.vehicleType
      });

      return { user, vehicle };
    } catch (error) {
      throw new Error('Registration failed: ' + (error as Error).message);
    }
  }

  // Vehicle Search
  async searchVehicleByNumber(vehicleNumber: string): Promise<VehicleSearchResult | null> {
    try {
      const result = await databaseService.getVehicleByNumber(vehicleNumber);
      if (!result) return null;
      
      return {
        user: {
          id: result.user_id,
          name: result.user_name || result.name,
          email: result.email,
          phone: result.phone,
          address: result.address,
          city: result.city,
          state: result.state,
          pincode: result.pincode
        } as User,
        vehicle: {
          id: result.id,
          user_id: result.user_id,
          vehicle_number: result.vehicle_number,
          make: result.make,
          model: result.model,
          year: result.year,
          color: result.color,
          vehicle_type: result.vehicle_type
        } as Vehicle
      };
    } catch (error) {
      throw new Error('Vehicle search failed: ' + (error as Error).message);
    }
  }

  async searchUserByPhone(phone: string): Promise<{ user: User; vehicles: Vehicle[] } | null> {
    try {
      const user = await databaseService.getUserByPhone(phone);
      if (!user) return null;
      
      const vehicles = await databaseService.getVehiclesByUserId(user.id!);
      return { user, vehicles };
    } catch (error) {
      throw new Error('User search failed: ' + (error as Error).message);
    }
  }

  // Service Booking
  async createServiceBooking(data: ServiceBookingData): Promise<ServiceBooking> {
    try {
      return await databaseService.createServiceBooking(data);
    } catch (error) {
      throw new Error('Booking failed: ' + (error as Error).message);
    }
  }

  // Admin Operations
  async adminLogin(username: string, password: string): Promise<LoginResponse> {
    return authService.login(username, password);
  }

  async getAllUsers(): Promise<User[]> {
    return databaseService.getAllUsers();
  }

  async getAllVehicles(): Promise<any[]> {
    return databaseService.getAllVehicles();
  }

  async getAllServiceBookings(): Promise<any[]> {
    return databaseService.getAllServiceBookings();
  }

  async updateBookingStatus(bookingId: number, status: string, adminNotes?: string): Promise<ServiceBooking> {
    return databaseService.updateBookingStatus(bookingId, status, adminNotes);
  }

  async getAllServices(): Promise<any[]> {
    return databaseService.getAllServices();
  }
}

export const apiService = new ApiService();