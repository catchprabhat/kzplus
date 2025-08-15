import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CreditCard, Smartphone, DollarSign, ArrowLeft, CheckCircle, Lock, IndianRupee } from 'lucide-react';
import { Service, ServiceBooking as ServiceBookingType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600">Please try again or contact support.</p>
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

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      
      // Create the booking after successful payment
      const servicesPayload = bookingData.selectedServices.map(service => ({
        id: service.id,


        name: service.name,
        price: service.price // This will now use the custom price we passed from ServiceBooking
      }));

      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        userId: bookingData.selectedUser.id,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        services: servicesPayload,
        totalPrice: bookingData.totalPrice,
        notes: bookingData.customerData.notes,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'pay-at-service' ? 'pending' : 'completed'
      });

      setTimeout(() => {
        setShowSuccess(false);
        const serviceBooking: ServiceBookingType = {
          id: response.data.booking.id.toString(),
          vehicleNumber: bookingData.selectedUser.vehicleNumber,
          vehicleType: bookingData.selectedUser.vehicleType,
          customerName: bookingData.customerData.name,
          customerPhone: bookingData.customerData.phone,
          customerEmail: bookingData.customerData.email,
          services: bookingData.selectedServices,
          totalPrice: bookingData.totalPrice,
          scheduledDate: new Date(bookingData.scheduledDate),
          scheduledTime: bookingData.scheduledTime,
          status: 'pending',
          notes: bookingData.customerData.notes,
          createdAt: new Date(),
        };

        onPaymentComplete(serviceBooking);
      }, 1000);
    } catch (error) {
      console.error('Payment failed:', error);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Booking Data</h1>
          <p className="text-gray-600">Please go back and try again.</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
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
        className="min-h-screen bg-gray-100 space-y-8 relative py-6 px-4 sm:px-6 lg:px-8"
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
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Booking
          </motion.button>
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            Payment Options
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Choose your preferred payment method to complete your service booking
          </motion.p>
        </div>

        {/* Booking Summary */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          variants={cardVariants}
          custom={0}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">{bookingData.selectedUser.vehicleNumber} ({bookingData.selectedUser.vehicleType})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{bookingData.customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">{new Date(bookingData.scheduledDate).toLocaleDateString()} at {bookingData.scheduledTime}</span>
            </div>
            <div className="border-t pt-3">
              <div className="text-gray-600 mb-2">Services:</div>
              {bookingData.selectedServices.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span>₹{service.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-600">₹{bookingData.totalPrice}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          variants={cardVariants}
          custom={1}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-green-600" />
            Mode of Payment
          </h3>

          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.button
              onClick={() => setPaymentMethod('debit')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                paymentMethod === 'debit'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter cardholder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
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
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <IndianRupee className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">Pay at Service Location</h4>
                  <p className="text-sm text-yellow-700">You can pay when our team arrives for the service. Cash and digital payments accepted.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Button */}
          <motion.button
            onClick={handlePayment}
            disabled={processing || (paymentMethod !== 'pay-at-service' && paymentMethod !== 'upi' && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv))}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {processing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Lock className="w-4 h-4 inline mr-2" />
                  {paymentMethod === 'pay-at-service' ? 'Confirm Booking' : `Pay ₹${bookingData.totalPrice}`}
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </PaymentPageErrorBoundary>
  );
};