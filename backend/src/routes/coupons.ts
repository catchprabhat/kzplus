import express, { Request, Response } from 'express';
import { sql } from '../config/database';
import { authenticateUser } from '../middleware/userAuth';

const router = express.Router();

router.post('/check-usage', authenticateUser, async (req: Request, res: Response) => {
  const { userId, couponCode } = req.body;
  
  try {
    // Check if user has used this coupon in the last 30 days
    const usageCheck = await sql`
      SELECT * FROM coupon_usage 
      WHERE user_id = ${userId} 
      AND coupon_code = ${couponCode} 
      AND used_at > NOW() - INTERVAL '30 days'
    ` as any[];
    
    const canUse = usageCheck.length === 0;
    
    res.json({ canUse, lastUsed: usageCheck[0]?.used_at || null });
  } catch (error) {
    console.error('Error checking coupon usage:', error);
    res.status(500).json({ error: 'Failed to check coupon usage' });
  }
});

export default router;