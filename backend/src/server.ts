import express, { Request, Response } from 'express';
import cors from 'cors';
// Remove or use the helmet import
// import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import carBookingsRouter from './routes/carBookings';
import couponRoutes from './routes/coupons';

// Import the route files
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import vehiclesRoutes from './routes/vehicles'; // Add this import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',  // Local frontend
  'http://127.0.0.1:5173',  // Alternative local frontend
  'https://kzplus.vercel.app',  // Production frontend
  'https://aplusautocare.vercel.app', // Another production frontend
  'https://kzplusautocare.in', // Your custom domain
  'https://www.kzplusautocare.in', // Your custom domain with www
  process.env.VITE_FRONTEND_URL || 'http://localhost:5173'  // From environment variable
];

// CORS configuration
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/car-bookings', carBookingsRouter);
app.use('/api/coupons', couponRoutes);

// Add this at the end to actually start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});