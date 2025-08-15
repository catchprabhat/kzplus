import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
// Remove or use the helmet import
// import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

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
  'https://kzplus.vercel.app', // Add your actual deployed frontend URL
  process.env.VITE_FRONTEND_URL || 'http://localhost:5173'  // From environment variable
];

// CORS configuration
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
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
app.use('/api/vehicles', vehiclesRoutes); // Add this line to register the vehicles routes

app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;