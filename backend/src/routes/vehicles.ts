import express, { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { sql } from '../config/database';

// Define type for query result
interface Vehicle {
  id: number; // Changed from string to number
  user_id: number; // Changed from string to number
  vehicle_number: string;
  vehicle_name: string;
  vehicle_type: string;
  model: string;
  year: number | null;
  color: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_address: string;
}

const router: Router = express.Router();

// Search vehicle by number
router.get(
  '/search/:vehicleNumber',
  [param('vehicleNumber').notEmpty().withMessage('Vehicle number is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { vehicleNumber } = req.params;

      const result = await sql`SELECT v.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone, u.address as owner_address
                              FROM vehicles v
                              JOIN users u ON u.id = v.user_id
                              WHERE v.vehicle_number = ${vehicleNumber.toUpperCase()}` as Vehicle[];

      if (result.length === 0) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const vehicle = result[0];
      res.json({
        id: vehicle.id,
        vehicleNumber: vehicle.vehicle_number,
        vehicleName: vehicle.vehicle_name,
        vehicleType: vehicle.vehicle_type,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        owner: {
          id: vehicle.user_id,
          name: vehicle.owner_name,
          email: vehicle.owner_email,
          phone: vehicle.owner_phone,
          address: vehicle.owner_address,
        },
      });
    } catch (error) {
      console.error('Error searching vehicle:', error);
      res.status(500).json({ error: 'Failed to search vehicle' });
    }
  }
);

export default router;