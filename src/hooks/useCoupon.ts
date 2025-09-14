import { useState, useCallback } from 'react';
import { couponService } from '../services/couponService';
import { Coupon, CouponValidationResult, AppliedCoupon } from '../types/coupon';

export const useCoupon = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateCoupon = useCallback(async (
    code: string, 
    orderAmount: number, 
    serviceType: string = 'car-booking'
  ): Promise<CouponValidationResult> => {
    if (!code.trim()) {
      const result = {
        isValid: false,
        message: 'Please enter a coupon code'
      };
      setValidationMessage(result.message);
      setIsValid(result.isValid);
      return result;
    }

    setIsValidating(true);
    
    try {
      const result = await couponService.validateCoupon(code, orderAmount, serviceType);
      setValidationMessage(result.message);
      setIsValid(result.isValid);
      return result;
    } catch (error) {
      const result = {
        isValid: false,
        message: 'Error validating coupon. Please try again.'
      };
      setValidationMessage(result.message);
      setIsValid(result.isValid);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const applyCoupon = useCallback(async (
    code: string, 
    orderAmount: number, 
    serviceType: string = 'car-booking'
  ): Promise<AppliedCoupon | null> => {
    const validation = await validateCoupon(code, orderAmount, serviceType);
    
    if (validation.isValid) {
      const applied = await couponService.applyCoupon(code, orderAmount, serviceType);
      if (applied) {
        setAppliedCoupon(applied);
        return applied; // Return the applied coupon data
      }
    }
    
    return null;
  }, [validateCoupon]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setValidationMessage('');
    setIsValid(false);
  }, []);

  const getCouponByCode = useCallback(async (code: string): Promise<Coupon | null> => {
    return await couponService.getCouponByCode(code);
  }, []);

  const getAllActiveCoupons = useCallback(async (): Promise<Coupon[]> => {
    return await couponService.getAllActiveCoupons();
  }, []);

  return {
    appliedCoupon,
    isValidating,
    validationMessage,
    isValid,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    getCouponByCode,
    getAllActiveCoupons
  };
};