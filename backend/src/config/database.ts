import path from 'path';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

if (!process.env.NETLIFY_DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
}

export const sql: NeonQueryFunction<any, any> = neon(process.env.NETLIFY_DATABASE_URL);