import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { sql } from '../config/database';
import { smsService } from '../services/smsService';

const router: Router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use a strong secret in production

// Send OTP to phone number
router.post(
  '/send-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const response = await smsService.sendOTP(phone);

      return res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      console.error('Send OTP error:', error);
      return res.status(500).json({ success: false, message: 'Failed to send verification code' });
    }
  }
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('otp').notEmpty().withMessage('Verification code is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp } = req.body;
      const response = await smsService.verifyOTP(phone, otp);

      if (response.success) {
        // Check if user exists
        const users = await sql`SELECT * FROM users WHERE phone = ${phone}` as any[];
        const user = users[0];

        if (user) {
          // User exists, generate token
          const token = jwt.sign(
            { id: user.id, phone: user.phone },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
              id: user.id,
              name: user.name,
              phone: user.phone,
              email: user.email || '',
              token
            },
            isNewUser: false
          });
        } else {
          // User doesn't exist, but we'll still allow them to login
          // Generate a temporary token for the unregistered user
          const tempToken = jwt.sign(
            { phone: phone, isTemporary: true },
            JWT_SECRET,
            { expiresIn: '1d' }
          );
          
          return res.status(200).json({
            success: true,
            message: 'Login successful. You can complete your profile later.',
            user: {
              phone: phone,
              name: '',
              email: '',
              token: tempToken
            },
            isNewUser: true
          });
        }
      }

      return res.status(400).json(response);
    } catch (error) {
      console.error('Verify OTP error:', error);
      return res.status(500).json({ success: false, message: 'Verification failed' });
    }
  }
);

// Register new user with phone
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone } = req.body;

      // We no longer require OTP verification for registration
      // This allows registration to happen independently
      
      // Check if user already exists
      const existingUsers = await sql`SELECT * FROM users WHERE phone = ${phone}` as any[];
      
      if (existingUsers.length > 0) {
        // If user exists, just update their name if it's empty
        const user = existingUsers[0];
        
        if (!user.name || user.name === '') {
          await sql`UPDATE users SET name = ${name} WHERE id = ${user.id}`;
        }
        
        // Generate token
        const token = jwt.sign(
          { id: user.id, phone: user.phone },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: user.id,
            name: name || user.name,
            phone: user.phone,
            email: user.email || '',
            token
          }
        });
      }

      // Create new user with default values for required fields
      const result = await sql`
        INSERT INTO users (name, phone, email, vehicle_number, vehicle_type, address)
        VALUES (${name}, ${phone}, '', 'PENDING', 'UNKNOWN', '')
        RETURNING id, name, phone, email
      ` as any[];

      const user = result[0];

      // Generate token
      const token = jwt.sign(
        { id: user.id, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
);

// Resend OTP
router.post(
  '/resend-otp',
  [
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const response = await smsService.resendOTP(phone);

      return res.status(response.success ? 200 : 400).json(response);
    } catch (error) {
      console.error('Resend OTP error:', error);
      return res.status(500).json({ success: false, message: 'Failed to resend verification code' });
    }
  }
);

export default router;