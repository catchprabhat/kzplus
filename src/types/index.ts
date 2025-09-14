export interface Car {
  id: string;
  name: string;
  image: string;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  pricePerHour: number; // Add this new field
  features: string[];
  available: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

// Add to existing Booking interface
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
  couponCode?: string;
  discountAmount?: number;
  originalPrice?: number;
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
  category: string; // Changed from enum to string to support new categories
  icon: string;
  color?: string; // Added color property
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
  model?: string | null;
  year?: number | null;
  color?: string | null;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  createdAt: Date;
  lastServicedDate?: string | null;
  lastServiceType?: string | null;
}

export interface CustomerFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  // Address Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Vehicle Information
  vehicleNumber: string;
  vehicleType: 'Sedan' | 'SUV' | 'Hatchback' | 'Sports' | 'Electric' | 'Other';
}

export interface CarSubmission {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  features: string[];
  description: string;
  images: string[];
  documents: {
    registration: string;
    insurance: string;
    pollution: string;
  };
  ownerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    licenseNumber: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface CarForSale {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  location: string;
  description: string;
  features: string[];
  images: string[];
  condition: 'excellent' | 'good' | 'fair' | 'needs-work';
  ownerType: 'individual' | 'dealer';
  registrationState: string;
  insuranceValid: boolean;
  accidentHistory: boolean;
  serviceHistory: string;
  reasonForSelling: string;
  negotiable: boolean;
  exchangeAccepted: boolean;
  financeAvailable: boolean;
  ownerDetails: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
    address: string;
    preferredContactTime: string;
    preferredContactMethod: 'phone' | 'email' | 'whatsapp' | 'any';
  };
  documents: {
    registration: string;
    insurance: string;
    pollution: string;
    serviceRecords?: string;
  };
  status: 'active' | 'sold' | 'inactive';
  views: number;
  inquiries: number;
  postedAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface SaleInquiry {
  id: string;
  carId: string;
  carTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  offerPrice?: number;
  financingNeeded: boolean;
  inspectionRequested: boolean;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'closed';
  createdAt: Date;
  respondedAt?: Date;
}


export interface SelfDriveBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  tripStartDate: Date;
  tripEndDate: Date;
  startTime: string;
  endTime: string;
  deliveryPickup: boolean;
  deliveryAddress?: string;
  nearbyLocation?: string;
  pincode?: string;
  googleMapsLocation?: string;

  carId?: string;
  carName?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
}