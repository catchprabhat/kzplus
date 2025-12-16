
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, Mail, Phone, Car, Save, X, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomerFormData } from '../types';

interface CustomerDetailsFormProps {
  onSubmit: (customerData: CustomerFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '+91',
    alternatePhone: '+91',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    vehicleNumber: '',
    vehicleType: 'Sedan',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Personal Information Validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim() || formData.phone === '+91') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    // Vehicle Information Validation
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSubmit(formData);
      }, 1000);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    if (field === 'phone' || field === 'alternatePhone') {
      // Ensure +91 prefix is always present
      if (!value.startsWith('+91')) {
        value = '+91' + value.replace(/^\+91/, '');
      }
      // Limit to +91 + 10 digits
      if (value.length > 13) {
        value = value.slice(0, 13);
      }
      // Only allow numbers after +91
      const phoneDigits = value.slice(3);
      if (phoneDigits && !/^\d*$/.test(phoneDigits)) {
        return; // Don't update if non-numeric characters after +91
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const vehicleTypes = ['Small Car', 'Sedan Car', 'Compact SUV', 'SUV', 'Luxury', 'Yellow Board', 'Bike'];

  // Animation variants for form content
  const formVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Animation variants for select options
  const optionVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    })
  };

  // Animation variants for success checkmark
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-4xl w-full relative overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customer Registration</h2>
              <p className="text-blue-100 dark:text-blue-200">Complete your profile to book car services</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-full transition-all duration-200 transform hover:scale-110"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-20"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <CheckCircle className="w-16 h-16 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <motion.div 
          className="p-6 overflow-y-auto max-h-[calc(100vh-200px)] dark:bg-dark-800"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                >
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer and Vehicle Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tell us about yourself and your vehicle</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <motion.input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="Enter your full name"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <motion.input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="your.email@example.com"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <motion.input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="+91 Enter 10 digit number"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternate Phone
                  </label>
                  <motion.input
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg focus:scale-[1.02]"
                    placeholder="+91 Enter 10 digit number"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <motion.textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.address ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="Enter your complete address"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.address && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.address}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-200"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode *
                  </label>
                  <motion.input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.pincode ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="123456"
                    maxLength={6}
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.pincode && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.pincode}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Number *
                  </label>
                  <motion.input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 dark:bg-dark-700 dark:text-white ${
                      errors.vehicleNumber ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    } hover:shadow-md focus:shadow-lg focus:scale-[1.02]`}
                    placeholder="KA01AB1234"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  />
                  <AnimatePresence>
                    {errors.vehicleNumber && (
                      <motion.p
                        className="text-red-500 dark:text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.vehicleNumber}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type *
                  </label>
                  <motion.select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 dark:text-white hover:shadow-md focus:shadow-lg focus:scale-[1.02]"
                    disabled={loading}
                    whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                  >
                    {vehicleTypes.map((type, index) => (
                      <motion.option
                        key={type}
                        value={type}
                        variants={optionVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        className="dark:bg-dark-700 dark:text-white"
                      >
                        {type}
                      </motion.option>
                    ))}
                  </motion.select>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 p-1 pb-2 min-h-[60px] sticky bottom-0 z-10">
          <div className="flex justify-end space-x-4">
            <motion.button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-dark-600 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Cancel</span>
              <motion.span
                className="absolute inset-0 bg-gray-200 dark:bg-dark-500 opacity-0"
                whileTap={{ opacity: 0.3, scale: 2 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            <motion.button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-all duration-200 flex items-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Complete Registration
                  </>
                )}
              </span>
              <motion.span
                className="absolute inset-0 bg-green-500 dark:bg-green-600 opacity-0"
                whileTap={{ opacity: 0.3, scale: 2 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
