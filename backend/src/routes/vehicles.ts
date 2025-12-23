
import express, { Request, Response, Router } from 'express';
import { param, validationResult, body } from 'express-validator';
import { sql } from '../config/database';

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
      const normalizedVehicleNumber = String(vehicleNumber).trim().toUpperCase();

      try {
        const userRows = await sql`
          SELECT
            id,
            name,
            email,
            phone,
            address,
            vehicle_number,
            vehicle_type
          FROM users
          WHERE vehicle_number = ${normalizedVehicleNumber}
          LIMIT 1
        ` as any[];

        if (userRows.length === 0) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }

        const u = userRows[0];
        const vehicle = {
          id: u.id,
          user_id: u.id,
          vehicle_number: u.vehicle_number,
          vehicle_type: u.vehicle_type,
          model: null,
          year: null,
          color: null,
          owner: {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            address: u.address,
          },
        };

        return res.json({ vehicle });
      } catch (error) {
        console.error('Error searching vehicle:', error);
        return res.status(500).json({ error: 'Failed to search vehicle' });
      }
    } catch (error) {
      console.error('Error searching vehicle:', error);
      return res.status(500).json({ error: 'Failed to search vehicle' });
    }
  }
);
router.get('/by-phone/:phone', async (req: Request, res: Response) => {
  const { phone } = req.params;

  try {
    const userVehicles = await sql`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        vehicle_number,
        vehicle_type
      FROM users
      WHERE phone = ${phone}
      ORDER BY created_at ASC
    ` as any[];

    const vehicles = userVehicles.map((u) => ({
      id: u.id,
      user_id: u.id,
      vehicle_number: u.vehicle_number,
      vehicle_type: u.vehicle_type,
      model: null,
      year: null,
      color: null,
      owner: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
      },
    }));

    return res.json({ vehicles });
  } catch (error) {
    console.error('Error listing vehicles by phone:', error);
    return res.status(500).json({ error: 'Failed to list vehicles' });
  }
});

// Add: Create a new vehicle for an existing user
// router.post('/add', ...) handler
router.post(
  '/add',
  [
    body('userId').isInt().withMessage('Valid userId is required'),
    body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, vehicleNumber, vehicleType } = req.body;

      if (!userId || !vehicleNumber || !vehicleType) {
        return res
          .status(400)
          .json({ error: 'userId, vehicleNumber, and vehicleType are required' });
      }

      const normalizedVehicleNumber = String(vehicleNumber).trim().toUpperCase();

      // Fetch owner details from users table
      const userResult = await sql`
        SELECT id, name, email, phone, address
        FROM users
        WHERE id = ${userId}
      ` as any[];

      const owner = userResult[0];
      if (!owner) {
        return res.status(404).json({ error: 'User not found for provided userId' });
      }

      // Prevent duplicate vehicle_number globally
      const existingVehicleRow = await sql`
        SELECT id
        FROM users
        WHERE vehicle_number = ${normalizedVehicleNumber}
      ` as any[];

      if (existingVehicleRow.length > 0) {
        return res.status(409).json({ error: 'Vehicle with this number already exists' });
      }

      // Insert a NEW users row for the new vehicle, copying owner details
      const inserted = await sql`
        INSERT INTO users (
          name,
          email,
          phone,
          address,
          vehicle_number,
          vehicle_type
        )
        VALUES (
          ${owner.name},
          ${owner.email},
          ${owner.phone},
          ${owner.address},
          ${normalizedVehicleNumber},
          ${vehicleType}
        )
        RETURNING
          id,
          name,
          email,
          phone,
          address,
          vehicle_number,
          vehicle_type
      ` as any[];

      const row = inserted[0];

      return res.status(201).json({
        message: 'Vehicle added successfully',
        vehicle: {
          id: row.id,
          userId: row.id,
          vehicleNumber: row.vehicle_number,
          vehicleType: row.vehicle_type,
          ownerName: row.name,
          ownerEmail: row.email,
          ownerPhone: row.phone,
          ownerAddress: row.address,
        },
      });
    } catch (error: any) {
      console.error('Failed to add vehicle:', error?.message || error);
      return res.status(500).json({ error: 'Failed to add vehicle' });
    }
  }
);

export default router;
