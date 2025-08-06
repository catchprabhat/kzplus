import express, { Request, Response, Router } from 'express';
import { sql } from '../config/database';

// Define type for services
interface Service {
  id: number; // Changed from string to number
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  active: boolean;
}

const router: Router = express.Router();

// Get all services
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await sql`SELECT id, name, description, price, duration, category, active
                              FROM services
                              WHERE active = true
                              ORDER BY id` as Service[];

    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

export default router;