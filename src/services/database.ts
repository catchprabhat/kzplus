import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export interface User {
  id?: number;
  email: string;
  phone: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id?: number;
  user_id: number;
  vehicle_number: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  vehicle_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceBooking {
  id?: number;
  user_id: number;
  vehicle_id: number;
  service_id: number;
  booking_date: string;
  preferred_time?: string;
  status?: string;
  total_amount?: number;
  customer_notes?: string;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
}

export class DatabaseService {
  // User operations
  async createUser(user: User): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, phone, name, address, city, state, pincode)
      VALUES (${user.email}, ${user.phone}, ${user.name}, ${user.address || ''}, ${user.city || ''}, ${user.state || ''}, ${user.pincode || ''})
      RETURNING *
    `;
    return result[0] as User;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE phone = ${phone}
    `;
    return result[0] as User || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] as User || null;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `;
    return result as User[];
  }

  // Vehicle operations
  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const result = await sql`
      INSERT INTO vehicles (user_id, vehicle_number, make, model, year, color, vehicle_type)
      VALUES (${vehicle.user_id}, ${vehicle.vehicle_number}, ${vehicle.make}, ${vehicle.model}, ${vehicle.year || null}, ${vehicle.color || ''}, ${vehicle.vehicle_type || ''})
      RETURNING *
    `;
    return result[0] as Vehicle;
  }

  async getVehicleByNumber(vehicleNumber: string): Promise<Vehicle & User | null> {
    const result = await sql`
      SELECT v.*, u.name as user_name, u.email, u.phone, u.address, u.city, u.state, u.pincode
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      WHERE v.vehicle_number = ${vehicleNumber}
    `;
    return result[0] as (Vehicle & User) || null;
  }

  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    const result = await sql`
      SELECT * FROM vehicles WHERE user_id = ${userId}
    `;
    return result as Vehicle[];
  }

  async getAllVehicles(): Promise<(Vehicle & User)[]> {
    const result = await sql`
      SELECT v.*, u.name as user_name, u.email, u.phone
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `;
    return result as (Vehicle & User)[];
  }

  // Service booking operations
  async createServiceBooking(booking: ServiceBooking): Promise<ServiceBooking> {
    const result = await sql`
      INSERT INTO service_bookings (user_id, vehicle_id, service_id, booking_date, preferred_time, total_amount, customer_notes)
      VALUES (${booking.user_id}, ${booking.vehicle_id}, ${booking.service_id}, ${booking.booking_date}, ${booking.preferred_time || null}, ${booking.total_amount || null}, ${booking.customer_notes || ''})
      RETURNING *
    `;
    return result[0] as ServiceBooking;
  }

  async getAllServiceBookings(): Promise<any[]> {
    const result = await sql`
      SELECT 
        sb.*,
        u.name as user_name,
        u.email,
        u.phone,
        v.vehicle_number,
        v.make,
        v.model,
        s.name as service_name,
        s.description as service_description
      FROM service_bookings sb
      JOIN users u ON sb.user_id = u.id
      JOIN vehicles v ON sb.vehicle_id = v.id
      JOIN services s ON sb.service_id = s.id
      ORDER BY sb.created_at DESC
    `;
    return result;
  }

  async updateBookingStatus(bookingId: number, status: string, adminNotes?: string): Promise<ServiceBooking> {
    const result = await sql`
      UPDATE service_bookings 
      SET status = ${status}, admin_notes = ${adminNotes || ''}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
      RETURNING *
    `;
    return result[0] as ServiceBooking;
  }

  // Admin operations
  async createAdminUser(admin: AdminUser): Promise<AdminUser> {
    const result = await sql`
      INSERT INTO admin_users (username, email, password_hash, role)
      VALUES (${admin.username}, ${admin.email}, ${admin.password_hash}, ${admin.role || 'admin'})
      RETURNING *
    `;
    return result[0] as AdminUser;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    const result = await sql`
      SELECT * FROM admin_users WHERE username = ${username} AND is_active = true
    `;
    return result[0] as AdminUser || null;
  }

  // Services operations
  async getAllServices(): Promise<any[]> {
    const result = await sql`
      SELECT * FROM services WHERE is_active = true ORDER BY name
    `;
    return result;
  }
}

export const databaseService = new DatabaseService();