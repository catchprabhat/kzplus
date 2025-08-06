import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Car, Phone, Calendar, Clock, User, Mail, Plus, Minus, Wrench, UserPlus, CheckCircle, MapPin } from 'lucide-react';
import axios from 'axios';
import { Service, ServiceBooking as ServiceBookingType, CustomerFormData } from '../types';
import { services } from '../data/services';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { PaymentPage } from './PaymentPage';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  createdAt: Date;
  lastServicedDate?: string | null;
  lastServiceType?: string | null;
}

interface ServiceBookingProps {
  onServiceBookingComplete: (booking: ServiceBookingType) => void;
  loading?: boolean;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  onServiceBookingComplete,
  loading = false
}) => {
  // Move all useState declarations to the top
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vehicle' | 'phone'>('vehicle');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
  const [showPaymentPage, setShowPaymentPage] = useState(false);

  // Hooks for authentication, bookings, and translation
  const { isAuthenticated, login } = useAuth();
  const { bookings } = useBookings();
  const { t, i18n } = useTranslation();

  // Toggle language between English and Kannada
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
  };

  // useEffect hooks after useState declarations
  useEffect(() => {
    console.log('ServiceBooking mounted');
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top when navigating to PaymentPage
  useEffect(() => {
    if (showPaymentPage) {
      console.log('Navigating to PaymentPage, scrolling to top');
      window.scrollTo(0, 0);
    }
  }, [showPaymentPage]);

  const searchUser = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchAttempted(true);

      let response;
      if (searchType === 'phone') {
        response = await axios.get(`http://localhost:5000/api/users/search/phone/${encodeURIComponent(searchQuery)}`);
        const user = response.data;
        setSelectedUser({
          id: user.id.toString(),
          vehicleNumber: user.vehicle_number,
          vehicleType: user.vehicle_type,
          ownerName: user.name,
          ownerPhone: user.phone,
          ownerEmail: user.email,
          createdAt: new Date(user.created_at),
          lastServicedDate: user.last_serviced_date,
          lastServiceType: user.last_service_type,
        });
        setCustomerData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          notes: ''
        });
      } else {
        response = await axios.get(`http://localhost:5000/api/users/search/vehicle/${encodeURIComponent(searchQuery)}`);
        const user = response.data;
        setSelectedUser({
          id: user.id.toString(),
          vehicleNumber: user.vehicle_number,
          vehicleType: user.vehicle_type,
          ownerName: user.name,
          ownerPhone: user.phone,
          ownerEmail: user.email,
          createdAt: new Date(),
          lastServicedDate: user.last_serviced_date,
          lastServiceType: user.last_service_type,
        });
        setCustomerData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          notes: ''
        });
      }
    } catch (error) {
      setSearchError(error.response?.data?.error || 'Search failed');
      setSelectedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerRegistration = async (formData: CustomerFormData) => {
    try {
      setCustomerFormLoading(true);

      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
      });

      const { user } = response.data;
      setSelectedUser({
        id: user.id.toString(),
        vehicleNumber: user.vehicle_number,
        vehicleType: user.vehicle_type,
        ownerName: user.name,
        ownerPhone: user.phone,
        ownerEmail: user.email,
        createdAt: new Date(user.created_at),
        lastServicedDate: null,
        lastServiceType: null,
      });
      setCustomerData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        notes: ''
      });

      setShowCustomerForm(false);
      setSearchError(null);
      setSearchAttempted(false);
      setSearchQuery(formData.vehicleNumber);

      setTimeout(() => {
        document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Failed to register customer:', error);
      setSearchError(error.response?.data?.error || 'Registration failed');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || selectedServices.length === 0 || !scheduledDate || loading) return;

    setShowPaymentPage(true);
  };

  const handlePaymentComplete = (serviceBooking: ServiceBookingType) => {
    setShowSuccess(true);
    
    setTimeout(() => {
      onServiceBookingComplete(serviceBooking);
      
      setSelectedUser(null);
      setSelectedServices([]);
      setScheduledDate('');
      setScheduledTime('09:00');
      setCustomerData({ name: '', email: '', phone: '', notes: '' });
      setSearchQuery('');
      setSearchAttempted(false);
      setIsRepeatServiceMode(false);
      setShowPaymentPage(false);
      setShowSuccess(false);
    }, 1000);
  };

  const handleBackFromPayment = () => {
    setShowPaymentPage(false);
  };

  const handleRepeatService = () => {
    setIsRepeatServiceMode(true);
    const previousService = services.find(s => s.id === 'wash-premium');
    if (previousService && !selectedServices.find(s => s.id === previousService.id)) {
      setSelectedServices([previousService]);
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

  // Navigation handlers
  const handleServiceNavigation = (service: string) => {
    const tabMap: { [key: string]: 'book' | 'services' | 'sale-purchase' } = {
      'self-drive': 'book',
      'car-services': 'services',
      'sale-purchase': 'sale-purchase'
    };
    const tab = tabMap[service];
    if (tab) {
      setActiveTab(tab);
    }
  };

  const handleTabChange = (tab: 'home' | 'book' | 'calendar' | 'bookings' | 'services' | 'service-bookings' | 'settings' | 'sale-purchase' | 'profile' | 'contact' | 'terms' | 'admin') => {
    setActiveTab(tab);
  };

  const handleAuthAction = (action: 'login' | 'logout') => {
    if (action === 'login') {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  };

  // State for active tab (to highlight current tab in mobile nav)
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'calendar' | 'bookings' | 'services' | 'service-bookings' | 'settings' | 'sale-purchase' | 'profile' | 'contact' | 'terms' | 'admin'>('services');

  const today = new Date().toISOString().split('T')[0];
  const isFormValid = selectedUser && selectedServices.length > 0 && scheduledDate && customerData.name && customerData.phone;

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

  if (showPaymentPage && selectedUser) {
    return (
      <PaymentPage
        bookingData={{
          selectedUser,
          selectedServices,
          scheduledDate,
          scheduledTime,
          customerData,
          totalPrice: calculateTotal()
        }}
        onPaymentComplete={handlePaymentComplete}
        onBack={handleBackFromPayment}
      />
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 space-y-8 relative py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8"
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
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {showCustomerForm && (
        <CustomerDetailsForm
          onSubmit={handleCustomerRegistration}
          onCancel={() => setShowCustomerForm(false)}
          loading={customerFormLoading}
        />
      )}

      <div className="text-center mb-12">
        <motion.div 
          className="flex justify-end mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('language_toggle')}
          </motion.button>
        </motion.div>
        <motion.h2 
          className="text-4xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {t('title')}
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
          variants={cardVariants}
          custom={0}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            {t('find_vehicle')}
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
                  {t('vehicle_number')}
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
                  {t('phone_number')}
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
                placeholder={searchType === 'vehicle' ? t('search_placeholder_vehicle') : t('search_placeholder_phone')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                disabled={searchLoading}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              />
              <motion.button
                onClick={searchUser}
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

            <AnimatePresence>
              {!selectedUser && !searchAttempted && (
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
                    <span className="relative z-10">{t('new_customer_register')}</span>
                    <motion.span
                      className="absolute inset-0 bg-green-500 opacity-0"
                      whileTap={{ opacity: 0.3, scale: 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {searchAttempted && (searchError || !selectedUser) && !searchLoading && (
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-blue-900 mb-2">{t('new_customer_prompt')}</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    {t('new_customer_message')}
                  </p>
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() => setShowCustomerForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="relative z-10">{t('register_now')}</span>
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

            {selectedUser && (
              <motion.div
                className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-semibold text-green-900 mb-2">{t('vehicle_found')}</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-700">Name:</span>
                      <span className="ml-2 font-semibold">{selectedUser.ownerName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-700">Vehicle Number:</span>
                      <span className="ml-2 font-semibold">{selectedUser.vehicleNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-700">Phone:</span>
                      <span className="ml-2 font-semibold">{selectedUser.ownerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-700">Last Serviced Date:</span>
                      <span className="ml-2 font-semibold">
                        {selectedUser.lastServicedDate 
                          ? new Date(selectedUser.lastServicedDate).toISOString().split('T')[0]
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-700">Last Service Type:</span>
                    <span className="ml-2 font-semibold">{selectedUser.lastServiceType || 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <motion.button
                    onClick={handleRepeatService}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('repeat_service')}
                  </motion.button>
                  <motion.button
                    onClick={handleSelectService}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    {t('more_service')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          id="service-selection" 
          className={`bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl ${isRepeatServiceMode ? 'opacity-50 pointer-events-none blur-sm' : ''}`}
          variants={cardVariants}
          custom={1}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-blue-600" />
            {t('select_services')}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {services.length === 0 ? (
              <p className="text-red-500 text-center">{t('no_services_available')}</p>
            ) : (
              services.map((service, index) => {
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
                    whileHover={{ scale: isRepeatServiceMode ? 1 : 1.02 }}
                    whileTap={{ scale: isRepeatServiceMode ? 1 : 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <motion.div className="mt-1" whileHover={{ scale: isRepeatServiceMode ? 1 : 1.1 }}>
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
                            <span className="font-semibold text-blue-600">₹{service.price}</span>
                          </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: isRepeatServiceMode ? 1 : 1.2 }}>
                        {isSelected ? (
                          <Minus className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })
            )}
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
                <h4 className="font-semibold text-blue-900 mb-2">{t('selected_services')} ({selectedServices.length})</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>₹{service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-200 mt-2 pt-2 font-bold text-blue-900">
                  {t('total')}: ₹{calculateTotal()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          id="booking-form" 
          className="bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl"
          variants={cardVariants}
          custom={2}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            {t('schedule_service')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('service_date')}
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
                  {t('preferred_time')}
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
                  {t('customer_name')}
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
                  {t('phone_number_form')}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {t('email')}
                </label>
                <motion.input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('additional_notes')}</label>
              <motion.textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                placeholder={t('notes_placeholder')}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('book_service')}
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

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t dark:border-dark-700 shadow-lg z-30 md:hidden transition-colors duration-300">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => handleServiceNavigation('self-drive')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'book'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <Car className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('book_car')}</span>
          </button>
          <button
            onClick={() => handleServiceNavigation('car-services')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'services'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <Wrench className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('services')}</span>
          </button>
          <button
            onClick={() => handleTabChange('bookings')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors relative"
          >
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('bookings')}</span>
            {!isAuthenticated && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
            {isAuthenticated && bookings.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {bookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('contact')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'contact'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('contact')}</span>
          </button>
          <button
            onClick={() => isAuthenticated ? handleTabChange('profile') : handleAuthAction('login')}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-orange-600 dark:text-orange-400'
                : 'hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <User className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {isAuthenticated ? t('profile') : t('login')}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};