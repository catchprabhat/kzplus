// Mock API service - replace with your actual API endpoints
const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API URL

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
    id: 'example-1',
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
    id: 'example-2',
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
    id: 'example-3',
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
      await delay(500); // Simulate network delay
      
      // For demo purposes, return mock data
      // Replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/bookings`);
      // if (!response.ok) throw new Error('Failed to fetch bookings');
      // return await response.json();
      
      return mockBookings;
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
        id: Date.now().toString(),
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