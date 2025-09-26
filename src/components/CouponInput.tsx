import React, { useState } from 'react';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { useCoupon } from '../hooks/useCoupon';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (discountAmount: number, finalAmount: number) => void;
  onCouponRemoved: () => void;
  serviceType?: string;
  bookingDurationHours?: number; // Add this prop
}

export const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  onCouponApplied,
  onCouponRemoved,
  serviceType = 'car-booking',
  bookingDurationHours // Add this prop
}) => {
  const [couponCode, setCouponCode] = useState('');
  
  const {
    appliedCoupon,
    isValidating,
    validationMessage,
    isValid,
    applyCoupon,
    removeCoupon
  } = useCoupon();

  const handleApplyCoupon = async () => {
    const appliedCouponData = await applyCoupon(couponCode, orderAmount, serviceType, bookingDurationHours);
    if (appliedCouponData) {
      onCouponApplied(appliedCouponData.discountAmount, appliedCouponData.finalAmount);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onCouponRemoved();
    setCouponCode('');
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
      <div className="flex items-center mb-3">
        <Tag className="w-5 h-5 mr-2 text-green-600" />
        <h4 className="font-semibold text-gray-900 dark:text-white">Apply Coupon</h4>
      </div>

      {!appliedCoupon ? (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isValidating}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isValidating ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {validationMessage && (
            <div className={`flex items-center space-x-2 text-sm ${
              isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {isValid ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{validationMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-black-600" />
              <div>
                <div className="font-medium text-black-800 dark:text-black-200">
                  {appliedCoupon.coupon.code} Applied
                </div>
                <div className="text-sm text-black-600 dark:text-black-300">
                  You saved ₹{appliedCoupon.discountAmount}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};