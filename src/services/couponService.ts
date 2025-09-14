import { Coupon, CouponValidationResult, AppliedCoupon } from '../types/coupon';

class CouponService {
  private coupons: Coupon[] = [
    {
      id: '1',
      code: 'DISCOUNT20',
      name: 'Special Discount',
      description: '20% discount on car bookings',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 2000,
      maxDiscountAmount: 5000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [
        'Valid only for car bookings above ₹2000',
        'Cannot be combined with other offers',
        'Valid for next 10 days only',
        'Maximum discount amount is ₹5000',
        'One time use per customer'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      code: 'FIRSTRIDE50',
      name: 'First Ride Offer',
      description: 'Flat ₹500 off on first booking',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 500,
      maxDiscountAmount: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [
        'Valid only for first-time users',
        'Minimum booking amount ₹500',
        'Valid for 30 days from registration',
        'Cannot be combined with other offers',
        'Applicable on all car booking services'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
  ];

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const coupon = this.coupons.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && c.isActive
    );
    return coupon || null;
  }

  async validateCoupon(
    code: string, 
    orderAmount: number, 
    serviceType: string = 'car-booking'
  ): Promise<CouponValidationResult> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return {
        isValid: false,
        message: 'Invalid coupon code'
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        isValid: false,
        message: 'This coupon is no longer active'
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return {
        isValid: false,
        message: 'This coupon has expired or is not yet valid'
      };
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      };
    }

    // Check service applicability
    if (!coupon.applicableServices.includes(serviceType)) {
      return {
        isValid: false,
        message: 'This coupon is not applicable for this service'
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        message: 'This coupon has reached its usage limit'
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return {
      isValid: true,
      message: `Coupon applied successfully! You saved ₹${discountAmount}`,
      discountAmount,
      finalAmount
    };
  }

  async applyCoupon(
    code: string, 
    orderAmount: number, 
    serviceType: string = 'car-booking'
  ): Promise<AppliedCoupon | null> {
    const validation = await this.validateCoupon(code, orderAmount, serviceType);
    
    if (!validation.isValid || !validation.discountAmount || !validation.finalAmount) {
      return null;
    }

    const coupon = await this.getCouponByCode(code);
    if (!coupon) return null;

    return {
      coupon,
      discountAmount: validation.discountAmount,
      originalAmount: orderAmount,
      finalAmount: validation.finalAmount
    };
  }

  async getAllActiveCoupons(): Promise<Coupon[]> {
    return this.coupons.filter(c => c.isActive);
  }

  // Admin methods for coupon management
  async addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...coupon,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.coupons.push(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.coupons[index] = {
      ...this.coupons[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.coupons[index];
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.coupons.splice(index, 1);
    return true;
  }
}

export const couponService = new CouponService();