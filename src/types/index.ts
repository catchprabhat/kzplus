export interface Car {
  id: string;
  name: string;
  image: string;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  features: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  carType: string;
  carSeats: number;
  pickupDate: Date;
  dropDate: Date;
  totalDays: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  bookings: Booking[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "2 hours", "1 day"
  category: 'cleaning' | 'maintenance' | 'repair' | 'enhancement';
  icon: string;
}

export interface ServiceBooking {
  id: string;
  vehicleNumber: string;
  vehicleName?: string;
  vehicleType?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  services: Service[];
  totalPrice: number;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  name: string;
  type: string;
  model: string;
  year: number;
  color: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  lastServiceDate?: Date;
  createdAt: Date;
}