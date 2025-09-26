import { Coupon, CouponValidationResult, AppliedCoupon } from '../types/coupon';

class CouponService {
  private coupons: Coupon[] = [
    {
      id: '1',
      code: 'JIX3D20',
      name: '3 Day Special',
      description: '20% off for bookings 72+ hours',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      usageLimit: undefined,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [
        'Valid only for bookings with duration of 72 hours or more',
        'Cannot be combined with other offers'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      code: 'JIX5D30',
      name: '5 Day Special',
      description: '30% off for bookings 120+ hours',
      discountType: 'percentage',
      discountValue: 30,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      usageLimit: undefined,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [
        'Valid only for bookings with duration of 120 hours or more',
        'Cannot be combined with other offers'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      code: 'JIX7D40',
      name: '7 Day Special',
      description: '40% off for bookings 168+ hours',
      discountType: 'percentage',
      discountValue: 40,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      usageLimit: undefined,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [
        'Valid only for bookings with duration of 168 hours or more',
        'Cannot be combined with other offers'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      code: 'JIXADMIN20',
      name: 'Admin Special',
      description: '20% off - No restrictions',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      usageLimit: undefined,
      usedCount: 0,
      isActive: true,
      applicableServices: ['car-booking'],
      termsAndConditions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
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
    serviceType: string = 'car-booking',
    bookingDurationHours?: number
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

    // Check duration requirements for specific coupons
    if (bookingDurationHours !== undefined) {
      if (coupon.code === 'JIX3D20' && bookingDurationHours < 72) {
        return {
          isValid: false,
          message: 'This coupon requires a booking duration of at least 72 hours (3 days)'
        };
      }
      if (coupon.code === 'JIX5D30' && bookingDurationHours < 120) {
        return {
          isValid: false,
          message: 'This coupon requires a booking duration of at least 120 hours (5 days)'
        };
      }
      if (coupon.code === 'JIX7D40' && bookingDurationHours < 168) {
        return {
          isValid: false,
          message: 'This coupon requires a booking duration of at least 168 hours (7 days)'
        };
      }
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
    serviceType: string = 'car-booking',
    bookingDurationHours?: number
  ): Promise<AppliedCoupon | null> {
    const validation = await this.validateCoupon(code, orderAmount, serviceType, bookingDurationHours);
    
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