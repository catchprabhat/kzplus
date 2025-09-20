import React, { useState, useEffect } from 'react';
import { Tag, X, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCoupon } from '../hooks/useCoupon';
import { Coupon } from '../types/coupon';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (discountAmount: number, finalAmount: number) => void;
  onCouponRemoved: () => void;
  serviceType?: string;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  onCouponApplied,
  onCouponRemoved,
  serviceType = 'car-booking'
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [showOffers, setShowOffers] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  
  const {
    appliedCoupon,
    isValidating,
    validationMessage,
    isValid,
    applyCoupon,
    removeCoupon,
    getAllActiveCoupons
  } = useCoupon();

  useEffect(() => {
    const loadCoupons = async () => {
      const coupons = await getAllActiveCoupons();
      setAvailableCoupons(coupons);
    };
    loadCoupons();
  }, [getAllActiveCoupons]);

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = code || couponCode;
    const appliedCouponData = await applyCoupon(codeToApply, orderAmount, serviceType);
    if (appliedCouponData) {
      onCouponApplied(appliedCouponData.discountAmount, appliedCouponData.finalAmount);
      setCouponCode(codeToApply);
      setShowOffers(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    onCouponRemoved();
    setCouponCode('');
    setShowOffers(false);
  };

  const handleCouponSelect = (code: string) => {
    setCouponCode(code);
    handleApplyCoupon(code);
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
              onClick={() => handleApplyCoupon()}
              disabled={!couponCode.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isValidating ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {/* View Offers Button */}
          <button
            type="button"
            onClick={() => setShowOffers(!showOffers)}
            className="flex items-center justify-between w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <span>View Offers</span>
            {showOffers ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Offers Dropdown */}
          {showOffers && (
            <div className="mt-2 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 shadow-lg">
              {availableCoupons.map((coupon) => (
                <div key={coupon.id} className="p-4 border-b border-gray-100 dark:border-dark-700 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-200">{coupon.code}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-200">{coupon.description}</p>
                    </div>
                    <button
                      onClick={() => handleCouponSelect(coupon.code)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="mt-2">
                    <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions:</h6>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {coupon.termsAndConditions.map((term, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

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