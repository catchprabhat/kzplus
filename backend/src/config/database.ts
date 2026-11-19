import path from 'path';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// backend/.env first so NETLIFY_DATABASE_URL is the database with real bookings
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.NETLIFY_DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
}

export const sql: NeonQueryFunction<any, any> = neon(process.env.NETLIFY_DATABASE_URL);