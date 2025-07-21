import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Car, Phone, Calendar, Clock, User, Mail, Plus, Minus, Wrench, UserPlus, CheckCircle } from 'lucide-react';
import { Service, Vehicle, ServiceBooking as ServiceBookingType } from '../types';
import { services } from '../data/services';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomerDetailsForm, CustomerFormData } from './CustomerDetailsForm';

interface ServiceBookingProps {
  onServiceBookingComplete: (booking: ServiceBookingType) => void;
  loading?: boolean;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  onServiceBookingComplete,
  loading = false
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vehicle' | 'phone'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormLoading, setCustomerFormLoading] = useState(false);
  const [isRepeatServiceMode, setIsRepeatServiceMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const searchVehicle = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchAttempted(true);

      await new Promise(resolve => setTimeout(resolve, 800));

      const mockVehicle: Vehicle = {
        id: '1',
        vehicleNumber: searchQuery.toUpperCase(),
        name: 'Honda Civic',
        type: 'Sedan',
        model: 'Civic LX',
        year: 2022,
        color: 'Silver',
        ownerName: 'John Doe',
        ownerPhone: '+1-555-0123',
        ownerEmail: 'john@example.com',
        lastServiceDate: new Date(2024, 10, 15),
        createdAt: new Date()
      };

      if (searchType === 'phone') {
        if (searchQuery === '5550123' || searchQuery === '+1-555-0123') {
          setSelectedVehicle(mockVehicle);
          setCustomerData({
            name: mockVehicle.ownerName,
            email: mockVehicle.ownerEmail,
            phone: mockVehicle.ownerPhone,
            notes: ''
          });
        } else {
          setSearchError('Customer not found.');
        }
      } else {
        if (searchQuery.toLowerCase().includes('abc') || searchQuery.toLowerCase().includes('123')) {
          setSelectedVehicle(mockVehicle);
          setCustomerData({
            name: mockVehicle.ownerName,
            email: mockVehicle.ownerEmail,
            phone: mockVehicle.ownerPhone,
            notes: ''
          });
        } else {
          setSelectedVehicle(null);
        }
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerRegistration = async (formData: CustomerFormData) => {
    try {
      setCustomerFormLoading(true);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        vehicleNumber: formData.vehicleNumber,
        name: `${formData.vehicleMake} ${formData.vehicleModel}`,
        type: formData.vehicleType,
        model: formData.vehicleModel,
        year: parseInt(formData.vehicleYear),
        color: formData.vehicleColor,
        ownerName: formData.name,
        ownerPhone: formData.phone,
        ownerEmail: formData.email,
        lastServiceDate: formData.lastServiceDate ? new Date(formData.lastServiceDate) : undefined,
        createdAt: new Date()
      };

      setSelectedVehicle(newVehicle);
      setCustomerData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.specialRequests || ''
      });

      if (formData.preferredDate) {
        setScheduledDate(formData.preferredDate);
      }
      setScheduledTime(formData.preferredTime);

      setShowCustomerForm(false);
      setSearchError(null);
      setSearchAttempted(false);

      setSearchQuery(formData.vehicleNumber);

      setTimeout(() => {
        document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Failed to register customer:', error);
    } finally {
      setCustomerFormLoading(false);
    }
  };

  const handleServiceToggle = (service: Service) => {
    if (isRepeatServiceMode) return;
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const getServiceIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      droplets: <div className="w-5 h-5 bg-blue-500 rounded-full"></div>,
      sparkles: <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>,
      shield: <div className="w-5 h-5 bg-green-500 rounded-full"></div>,
      star: <div className="w-5 h-5 bg-purple-500 rounded-full"></div>,
      wind: <div className="w-5 h-5 bg-cyan-500 rounded-full"></div>,
      home: <div className="w-5 h-5 bg-orange-500 rounded-full"></div>,
      droplet: <div className="w-5 h-5 bg-blue-600 rounded-full"></div>,
      disc: <div className="w-5 h-5 bg-red-500 rounded-full"></div>,
      circle: <div className="w-5 h-5 bg-gray-500 rounded-full"></div>,
      search: <div className="w-5 h-5 bg-indigo-500 rounded-full"></div>,
      battery: <div className="w-5 h-5 bg-green-600 rounded-full"></div>,
      wrench: <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
    };
    return iconMap[iconName] || <Wrench className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleaning': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'maintenance': return 'bg-green-50 border-green-200 text-green-800';
      case 'repair': return 'bg-red-50 border-red-200 text-red-800';
      case 'enhancement': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle || selectedServices.length === 0 || !scheduledDate || loading) return;

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      const serviceBooking: ServiceBookingType = {
        id: Date.now().toString(),
        vehicleNumber: selectedVehicle.vehicleNumber,
        vehicleName: selectedVehicle.name,
        vehicleType: selectedVehicle.type,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        services: selectedServices,
        totalPrice: calculateTotal(),
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        status: 'pending',
        notes: customerData.notes,
        createdAt: new Date()
      };

      onServiceBookingComplete(serviceBooking);

      setSelectedVehicle(null);
      setSelectedServices([]);
      setScheduledDate('');
      setScheduledTime('09:00');
      setCustomerData({ name: '', email: '', phone: '', notes: '' });
      setSearchQuery('');
      setSearchAttempted(false);
      setIsRepeatServiceMode(false);
    }, 1000);
  };

  const handleRepeatService = () => {
    setIsRepeatServiceMode(true);
    if (selectedVehicle?.lastServiceDate) {
      const previousService = services.find(s => s.id === 'wash-premium');
      if (previousService && !selectedServices.find(s => s.id === previousService.id)) {
        setSelectedServices([previousService]);
      }
    }
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleSelectService = () => {
    setIsRepeatServiceMode(false);
    setTimeout(() => {
      document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const today = new Date().toISOString().split('T')[0];
  const isFormValid = selectedVehicle && selectedServices.length > 0 && scheduledDate && customerData.name && customerData.phone;

  // Animation variants
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

  return (
    <motion.div 
      className="space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Registration Form Modal */}
      {showCustomerForm && (
        <CustomerDetailsForm
          onSubmit={handleCustomerRegistration}
          onCancel={() => setShowCustomerForm(false)}
          loading={customerFormLoading}
        />
      )}

      {/* Hero Section with Vehicle Search */}
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          Book Car Services
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Professional car maintenance and detailing services at your convenience
        </motion.p>

        {/* Find Your Vehicle Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
          variants={cardVariants}
          custom={0}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Find Your Vehicle
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <motion.button
                onClick={() => setSearchType('vehicle')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  searchType === 'vehicle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } relative overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  <Car className="w-4 h-4 inline mr-2" />
                  Vehicle Number
                </span>
                <motion.span
                  className="absolute inset-0 bg-blue-500 opacity-0"
                  whileTap={{ opacity: 0.3, scale: 2 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
              <motion.button
                onClick={() => setSearchType('phone')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  searchType === 'phone'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } relative overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </span>
                <motion.span
                  className="absolute inset-0 bg-blue-500 opacity-0"
                  whileTap={{ opacity: 0.3, scale: 2 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </div>

            <div className="flex space-x-2">
              <motion.input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchAttempted(false);
                }}
                placeholder={searchType === 'vehicle' ? 'Enter vehicle number (e.g., ABC123)' : 'Enter phone number (e.g., 5550123)'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                disabled={searchLoading}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              />
              <motion.button
                onClick={searchVehicle}
                disabled={!searchQuery.trim() || searchLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  {searchLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </span>
                <motion.span
                  className="absolute inset-0 bg-blue-500 opacity-0"
                  whileTap={{ opacity: 0.3, scale: 2 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </div>

            {/* New Customer Button */}
            <AnimatePresence>
              {!selectedVehicle && !searchAttempted && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowCustomerForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="relative z-10">New Customer? Register Here</span>
                    <motion.span
                      className="absolute inset-0 bg-green-500 opacity-0"
                      whileTap={{ opacity: 0.3, scale: 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Customer Message */}
            <AnimatePresence>
              {searchAttempted && (searchError || !selectedVehicle) && !searchLoading && (
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-blue-900 mb-2">New Customer?</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    Don't worry! We'll help you register quickly and get your vehicle serviced.
                  </p>
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() => setShowCustomerForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="relative z-10">Register Now</span>
                      <motion.span
                        className="absolute inset-0 bg-blue-500 opacity-0"
                        whileTap={{ opacity: 0.3, scale: 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle Found */}
            <AnimatePresence>
              {selectedVehicle && (
                <motion.div
                  className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-green-900 mb-2">Vehicle Found!</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                    <div><strong>Vehicle:</strong> {selectedVehicle.name}</div>
                    <div><strong>Number:</strong> {selectedVehicle.vehicleNumber}</div>
                    <div><strong>Type:</strong> {selectedVehicle.type}</div>
                    <div><strong>Year:</strong> {selectedVehicle.year}</div>
                    <div><strong>Owner:</strong> {selectedVehicle.ownerName}</div>
                    <div><strong>Phone:</strong> {selectedVehicle.ownerPhone}</div>
                  </div>
                  {selectedVehicle.lastServiceDate && (
                    <div className="mt-2 text-sm text-green-700">
                      <strong>Last Service:</strong> {selectedVehicle.lastServiceDate.toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-4 flex space-x-4">
                    <motion.button
                      onClick={handleRepeatService}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10">
                        <Calendar className="w-4 h-4 mr-2" />
                        Repeat Service
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-blue-500 opacity-0"
                        whileTap={{ opacity: 0.3, scale: 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                    <motion.button
                      onClick={handleSelectService}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10">
                        <Wrench className="w-4 h-4 mr-2" />
                        More Service
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-blue-500 opacity-0"
                        whileTap={{ opacity: 0.3, scale: 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Service Selection and Booking Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Service Selection */}
        <motion.div 
          id="service-selection" 
          className={`bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl ${isRepeatServiceMode ? 'opacity-50 pointer-events-none' : ''}`}
          variants={cardVariants}
          custom={1}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-blue-600" />
            Select Services
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {services.map((service, index) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <motion.div
                  key={service.id}
                  onClick={() => handleServiceToggle(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isRepeatServiceMode ? 'cursor-not-allowed' : ''} hover:shadow-md`}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <motion.div className="mt-1" whileHover={{ scale: 1.1 }}>
                        {getServiceIcon(service.icon)}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(service.category)}`}>
                            {service.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </span>
                          <span className="font-semibold text-blue-600">${service.price}</span>
                        </div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.2 }}>
                      {isSelected ? (
                        <Minus className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedServices.length > 0 && (
              <motion.div
                className="mt-4 p-4 bg-blue-50 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-semibold text-blue-900 mb-2">Selected Services ({selectedServices.length})</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>${service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-200 mt-2 pt-2 font-bold text-blue-900">
                  Total: ${calculateTotal()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Booking Form */}
        <motion.div 
          id="booking-form" 
          className="bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl"
          variants={cardVariants}
          custom={2}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Schedule Service
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Service Date
                </label>
                <motion.input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Preferred Time
                </label>
                <motion.select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:shadow-md focus:shadow-lg"
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 9 + i;
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    return (
                      <motion.option
                        key={time}
                        value={time}
                        variants={cardVariants}
                        custom={i}
                      >
                        {displayTime}
                      </motion.option>
                    );
                  })}
                </motion.select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Customer Name
                </label>
                <motion.input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <motion.input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <motion.input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                required
                whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <motion.textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                placeholder="Any specific requirements or notes..."
                whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
                isFormValid && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Service - ${calculateTotal()}
                  </>
                )}
              </span>
              <motion.span
                className="absolute inset-0 bg-blue-500 opacity-0"
                whileTap={{ opacity: 0.3, scale: 2 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}