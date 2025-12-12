import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CreditCard, Smartphone, DollarSign, ArrowLeft, CheckCircle, Lock, IndianRupee } from 'lucide-react';
import { Service, ServiceBooking as ServiceBookingType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { CouponInput } from './CouponInput';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { serviceBookingApi } from '../services/api';

interface PaymentPageProps {
  bookingData: {
    selectedUser: {
      id: string;
      vehicleNumber: string;
      vehicleType: string;
      ownerName: string;
      ownerPhone: string;
      ownerEmail: string;
    };
    selectedServices: Service[];
    scheduledDate: string;
    scheduledTime: string;
    customerData: {
      name: string;
      email: string;
      phone: string;
      notes: string;
    };
    totalPrice: number;
  };
  onPaymentComplete: (booking: ServiceBookingType) => void;
  onBack: () => void;
}

// Error Boundary Component
class PaymentPageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300">Please try again or contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  bookingData,
  onPaymentComplete,
  onBack
}) => {
  // Scroll to top on component mount
  useEffect(() => {
    console.log('PaymentPage mounted, scrolling to top');
    window.scrollTo(0, 0);
  }, []);

  // Debug props
  useEffect(() => {
    console.log('PaymentPage bookingData:', bookingData);
  }, [bookingData]);

  const [paymentMethod, setPaymentMethod] = useState<'debit' | 'credit' | 'upi' | 'pay-at-service'>('debit');
  const [upiOption, setUpiOption] = useState<'gpay' | 'paytm' | 'phonepe'>('gpay');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  const successVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 10 
      }
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountedTotal, setDiscountedTotal] = useState(bookingData.totalPrice);
  const [originalTotal] = useState(bookingData.totalPrice);

  // Add the missing coupon handler functions
  // Update the handleCouponApplied function
  const handleCouponApplied = (discountAmount: number, finalAmount: number, couponData?: any) => {
    setAppliedCoupon({
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      code: couponData?.coupon?.code || null,
      coupon: couponData?.coupon || null
    });
    setDiscountedTotal(finalAmount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountedTotal(originalTotal);
  };

  // Add the missing handlePayment function
  const handlePayment = async () => {
    if (processing) return;
    
    setProcessing(true);

    // Defensive auth check: block if token missing/expired
    const token = localStorage.getItem('driveEasyToken');
    if (!token) {
      alert('Please log in to confirm your booking.');
      setProcessing(false);
      onBack();
      return;
    }
    
    try {
      const serviceBookingData = {
        userId: bookingData.selectedUser.id,
        vehicleId: bookingData.selectedUser.id,
        customerName: bookingData.customerData.name,
        customerPhone: bookingData.customerData.phone,
        customerEmail: bookingData.customerData.email,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        services: bookingData.selectedServices,
        totalPrice: discountedTotal,
        notes: bookingData.customerData.notes || '',
        couponCode: appliedCoupon?.code || null,
        discountAmount: appliedCoupon?.discountAmount || 0,
        originalAmount: originalTotal
      };
  
      // Use the existing service booking API
      const result = await serviceBookingApi.createBooking(serviceBookingData);
      
      const serviceBooking: ServiceBookingType = {
        ...result,
        originalAmount: appliedCoupon ? originalTotal : discountedTotal,
        discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod,
        paymentStatus: paymentMethod === 'pay-at-service' ? 'pending' : 'completed'
      };
  
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentComplete(serviceBooking);
      }, 2000);
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate bookingData to prevent undefined errors
  if (!bookingData || !bookingData.selectedUser || !bookingData.selectedServices) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Invalid Booking Data</h1>
          <p className="text-gray-600 dark:text-gray-300">Please go back and try again.</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <PaymentPageErrorBoundary>
      <motion.div 
        className="min-h-screen bg-gray-100 dark:bg-dark-900 space-y-8 relative py-6 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Payment Successful!</h3>
                <p className="text-lg">Your booking has been confirmed</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Booking
          </motion.button>
          <motion.h2 
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            Payment Options
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Choose your preferred payment method to complete your service booking
          </motion.p>
        </div>

        {/* Booking Summary */}
        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          variants={cardVariants}
          custom={0}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Vehicle:</span>
              <span className="font-medium text-gray-900 dark:text-white">{bookingData.selectedUser.vehicleNumber} ({bookingData.selectedUser.vehicleType})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Customer:</span>
              <span className="font-medium text-gray-900 dark:text-white">{bookingData.customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Date & Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">{new Date(bookingData.scheduledDate).toLocaleDateString()} at {bookingData.scheduledTime}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-dark-600 pt-3">
              <div className="text-gray-600 dark:text-gray-300 mb-2">Services:</div>
              {bookingData.selectedServices.map((service, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-900 dark:text-white">
                  <span>{service.name}</span>
                  <span>₹{service.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-dark-600 pt-3 flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total Amount:</span>
              <span className="text-blue-600 dark:text-blue-400">₹{originalTotal}</span>
            </div>
          </div>
        </motion.div>

        {/* Coupon Input Section */}
        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          variants={cardVariants}
          custom={1}
        >
          <CouponInput
            orderAmount={originalTotal}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            serviceType="service-booking"
          />
          
          {appliedCoupon && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">Discount Applied</div>
                  <div className="text-sm text-green-600 dark:text-green-300">You saved ₹{appliedCoupon.discountAmount}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">₹{originalTotal}</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">₹{discountedTotal}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Payment Methods */}
        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          variants={cardVariants}
          custom={2}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Mode of Payment
          </h3>

          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.button
              onClick={() => setPaymentMethod('debit')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                paymentMethod === 'debit'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Debit Card</span>
            </motion.button>

            <motion.button
              onClick={() => setPaymentMethod('credit')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                paymentMethod === 'credit'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Credit Card</span>
            </motion.button>

            <motion.button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                paymentMethod === 'upi'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">UPI Payment</span>
            </motion.button>

            <motion.button
              onClick={() => setPaymentMethod('pay-at-service')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                paymentMethod === 'pay-at-service'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IndianRupee className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Pay at Service</span>
            </motion.button>
          </div>

          {/* Card Details Form */}
          {(paymentMethod === 'debit' || paymentMethod === 'credit') && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter cardholder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* UPI Options */}
          {paymentMethod === 'upi' && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  onClick={() => setUpiOption('gpay')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    upiOption === 'gpay'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2"></div>
                  <span className="text-sm font-medium">GPay</span>
                </motion.button>

                <motion.button
                  onClick={() => setUpiOption('paytm')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    upiOption === 'paytm'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-blue-800 rounded mx-auto mb-2"></div>
                  <span className="text-sm font-medium">Paytm</span>
                </motion.button>

                <motion.button
                  onClick={() => setUpiOption('phonepe')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    upiOption === 'phonepe'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded mx-auto mb-2"></div>
                  <span className="text-sm font-medium">PhonePe</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Pay at Service Info */}
          {paymentMethod === 'pay-at-service' && (
            <motion.div 
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <IndianRupee className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Pay at Service Location</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">You can pay when our team arrives for the service. Cash and digital payments accepted.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Button */}
          <motion.button
            onClick={handlePayment}
            disabled={processing || (paymentMethod !== 'pay-at-service' && paymentMethod !== 'upi' && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv))}
            className="w-full mt-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {processing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Lock className="w-4 h-4 inline mr-2" />
                  {paymentMethod === 'pay-at-service' ? 'Confirm Booking' : `Pay ₹${discountedTotal}`}
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </PaymentPageErrorBoundary>
  );
};