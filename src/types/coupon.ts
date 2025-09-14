export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableServices: string[];
  termsAndConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount?: number;
  finalAmount?: number;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}