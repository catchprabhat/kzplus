import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Car, Phone, Calendar, Clock, User, Mail, Plus, Minus, Wrench, UserPlus, CheckCircle, MapPin, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { Service, ServiceBooking as ServiceBookingType, CustomerFormData } from '../types';
import { services, servicesByCategory } from '../data/services';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { PaymentPage } from './PaymentPage';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { useTranslation } from 'react-i18next';
import { ComingSoon } from './ComingSoon';
import { OTPLoginForm } from './OTPLoginForm';
import { ContactPage } from './ContactPage';
import { API_BASE_URL } from '../services/api';

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
  const [vehicleCategory, setVehicleCategory] = useState<keyof typeof servicesByCategory>('Small Car');
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'calendar' | 'bookings' | 'services' | 'service-bookings' | 'settings' | 'sale-purchase' | 'profile' | 'terms' | 'admin' | 'coming-soon' | 'login' | 'contact'>('services');
  const [comingSoonTitle, setComingSoonTitle] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customServiceValues, setCustomServiceValues] = useState<Record<string, { price: number, duration: string }>>({});

  const { isAuthenticated, login, logout } = useAuth();
  const { bookings } = useBookings();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Define services that should have custom price and duration inputs for each category
  const customizableServices = {
    'Bike': ['Mechanic Work', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others', 'Periodic Maintenance'],
    'Small Car': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others'],
    'Sedan Car': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others'],
    'Compact SUV': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others'],
    'SUV': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others'],
    'Luxury': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others'],
    'Yellow Board': ['Mechanic Work', 'Periodic Maintenance', 'Tyre Change', 'Rim Restoration', 'Dent & Paint', 'Seat Cover', 'Accessories', 'Others']
  };

  // Check if a service should have custom inputs
  const shouldHaveCustomInputs = (service: Service) => {
    return customizableServices[vehicleCategory as keyof typeof customizableServices]?.includes(service.name);
  };

  useEffect(() => {
    console.log('ServiceBooking mounted');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showPaymentPage) {
      console.log('Navigating to PaymentPage, scrolling to top');
      window.scrollTo(0, 0);
    }
  }, [showPaymentPage]);

  useEffect(() => {
    setFilteredServices(servicesByCategory[vehicleCategory] || []);
    // Clear selected services when vehicle category changes
    setSelectedServices([]);
  }, [vehicleCategory]);

  const searchUser = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchAttempted(true);

      let response;
      if (searchType === 'phone') {
        response = await axios.get(`${API_BASE_URL}/users/search/phone/${encodeURIComponent(searchQuery)}`);
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
        response = await axios.get(`${API_BASE_URL}/users/search/vehicle/${encodeURIComponent(searchQuery)}`);
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
    } catch (error: any) {
      setSearchError(error.response?.data?.error || 'Search failed');
      setSelectedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerRegistration = async (formData: CustomerFormData) => {
    try {
      setCustomerFormLoading(true);

      const response = await axios.post(`${API_BASE_URL}/users/register`, {
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
    } catch (error: any) {
      console.error('Failed to register customer:', error);
      
      // If user already exists, try to update their profile
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        try {
          // Search for existing user and update their vehicle info
          const searchResponse = await axios.get(`${API_BASE_URL}/users/search/phone/${formData.phone}`);
          const existingUser = searchResponse.data;
          
          // Update vehicle information
          await axios.put(`${API_BASE_URL}/users/profile`, {
            userId: existingUser.id,
            vehicleNumber: formData.vehicleNumber,
            vehicleType: formData.vehicleType,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`
          });
          
          // Set the updated user
          setSelectedUser({
            id: existingUser.id.toString(),
            vehicleNumber: formData.vehicleNumber,
            vehicleType: formData.vehicleType,
            ownerName: existingUser.name,
            ownerPhone: existingUser.phone,
            ownerEmail: existingUser.email,
            createdAt: new Date(existingUser.created_at),
            lastServicedDate: existingUser.last_serviced_date,
            lastServiceType: existingUser.last_service_type,
          });
          
          setCustomerData({
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            notes: ''
          });

          setShowCustomerForm(false);
          setSearchError(null);
          setSearchAttempted(false);
          setSearchQuery(formData.vehicleNumber);

          setTimeout(() => {
            document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
          
          return; // Success!
        } catch (updateError) {
          console.error('Failed to update existing user:', updateError);
        }
      }
      
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
        // Remove custom values when service is deselected
        setCustomServiceValues(prevValues => {
          const newValues = { ...prevValues };
          delete newValues[service.id];
          return newValues;
        });
        return prev.filter(s => s.id !== service.id);
      } else {
        // Initialize custom values with default values when service is selected
        if (shouldHaveCustomInputs(service)) {
          setCustomServiceValues(prevValues => ({
            ...prevValues,
            [service.id]: { price: service.price, duration: service.duration }
          }));
        }
        return [...prev, service];
      }
    });
  };

  // Handle custom price change
  const handleCustomPriceChange = (serviceId: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setCustomServiceValues(prev => ({
        ...prev,
        [serviceId]: { ...prev[serviceId], price: numericValue }
      }));
    }
  };

  // Handle custom duration change
  const handleCustomDurationChange = (serviceId: string, value: string) => {
    setCustomServiceValues(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], duration: value }
    }));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      const price = customServiceValues[service.id]?.price ?? service.price;
      return total + price;
    }, 0);
  };

  const getServiceIcon = (service: Service) => {
    const colorMap: Record<string, string> = {
      'blue': '#3b82f6',
      'green': '#22c55e',
      'indigo': '#6366f1',
      'orange': '#f97316',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'red': '#ef4444',
    };
    
    const bgColor = colorMap[service.color || 'blue'] || '#3b82f6';
    
    return (
      <div 
        className="w-5 h-5 rounded-full" 
        style={{ backgroundColor: bgColor }}
      ></div>
    );
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

  const handleTabChange = (tab: 'home' | 'book' | 'calendar' | 'bookings' | 'services' | 'service-bookings' | 'settings' | 'sale-purchase' | 'profile' | 'terms' | 'admin' | 'coming-soon' | 'login' | 'contact') => {
    const protectedRoutes = ['bookings', 'calendar', 'service-bookings', 'settings', 'profile'];
    if (protectedRoutes.includes(tab) && !isAuthenticated) {
      setActiveTab('login');
      return;
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile && tab === 'bookings') {
      setComingSoonTitle('My Bookings');
      setActiveTab('coming-soon');
      setMobileMenuOpen(false);
      return;
    }

    setActiveTab(tab);
    if (tab === 'book') {
      setSearchQuery('');
      setSelectedUser(null);
      setSelectedServices([]);
      setScheduledDate('');
      setScheduledTime('09:00');
      setCustomerData({ name: '', email: '', phone: '', notes: '' });
      setSearchAttempted(false);
      setSearchError(null);
      setShowCustomerForm(false);
      setIsRepeatServiceMode(false);
      setShowPaymentPage(false);
      setShowSuccess(false);
      window.scrollTo(0, 0);
    }
    setMobileMenuOpen(false);
  };

  const handleAuthAction = (action: 'login' | 'logout') => {
    if (action === 'login') {
      setMobileMenuOpen(true);
      setActiveTab('login');
    } else {
      logout();
      setActiveTab('home');
      setMobileMenuOpen(false);
    }
  };

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

  if (activeTab === 'coming-soon') {
    return <ComingSoon title={comingSoonTitle} />;
  }

  if (activeTab === 'login') {
    return <OTPLoginForm onLogin={login} />;
  }

  if (activeTab === 'contact') {
    return <ContactPage />;
  }

  if (showPaymentPage && selectedUser) {
    return (
      <PaymentPage
        bookingData={{
          selectedUser,
          selectedServices: selectedServices.map(service => ({
            ...service,
            price: customServiceValues[service.id]?.price ?? service.price,
            duration: customServiceValues[service.id]?.duration ?? service.duration
          })),
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
      className="min-h-screen bg-gray-100 dark:bg-dark-900 space-y-6 sm:space-y-8 relative py-4 sm:py-6 px-3 sm:px-4 lg:px-8 pb-20 md:pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-dark-800 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Navigation</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <X className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              {/* User Info */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">User Name</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">user@email.com</p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="space-y-2">
                <button 
                  onClick={() => handleTabChange('home')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'home'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Home
                </button>
                <button 
                  onClick={() => handleTabChange('book')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'book'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Book a Car
                </button>
                <button 
                  onClick={() => handleTabChange('calendar')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : isAuthenticated
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Calendar
                </button>
                <button 
                  onClick={() => handleTabChange('bookings')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab == 'bookings'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : isAuthenticated
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  My Bookings
                </button>
                <button 
                  onClick={() => handleTabChange('services')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'services'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Car Services
                </button>
                <button 
                  onClick={() => handleTabChange('service-bookings')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'service-bookings'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : isAuthenticated
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Service Bookings
                </button>
                <button 
                  onClick={() => handleTabChange('sale-purchase')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'sale-purchase'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Sale/Purchase
                </button>
                <button 
                  onClick={() => handleTabChange('contact')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'contact'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Contact Us
                </button>
                <button 
                  onClick={() => handleTabChange('terms')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'terms'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => handleTabChange('settings')} 
                  className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : isAuthenticated
                      ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                  Settings
                </button>
                <div className="border-t dark:border-dark-600 pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => handleTabChange('profile')} 
                        className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                          activeTab === 'profile'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                        }`}
                        disabled={!isAuthenticated}
                      >
                        <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                        Profile
                      </button>
                      <button 
                        onClick={() => handleAuthAction('logout')} 
                        className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleAuthAction('login')} 
                      className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-left bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3" />
                      Login
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 md:w-16 md:h-16 text-white" />
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
          className="text-4xl font-bold text-gray-400 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {t('title')}
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-md mx-auto"
          variants={cardVariants}
          custom={0}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-2 text-blue-600" />
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
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-2" />
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
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-2" />
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
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5" />
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
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4" />
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
                  <p className="text-blue-800 text-sm mb-3">{t('new_customer_message')}</p>
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() => setShowCustomerForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4" />
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
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 mr-2" />
                    {t('repeat_service')}
                  </motion.button>
                  <motion.button
                    onClick={handleSelectService}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 mr-2" />
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
          className={`bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6 lg:ml-auto lg:max-w-xl ${isRepeatServiceMode ? 'opacity-50 pointer-events-none blur-sm' : ''}`}
          variants={cardVariants}
          custom={1}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-2 text-blue-600" />
            {t('select_services')}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Category
            </label>
            <div className="relative">
              <select
                value={vehicleCategory}
                onChange={(e) => setVehicleCategory(e.target.value as keyof typeof servicesByCategory)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-white hover:shadow-md focus:shadow-lg appearance-none"
              >
                {Object.keys(servicesByCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredServices.length === 0 ? (
              <p className="text-red-500 text-center">{t('no_services_available')}</p>
            ) : (
              filteredServices.map((service, index) => {
                const isSelected = selectedServices.find(s => s.id === service.id);
                return (
                  <motion.div
                    key={service.id}
                    onClick={() => !shouldHaveCustomInputs(service) && handleServiceToggle(service)}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
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
                          {getServiceIcon(service)}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {shouldHaveCustomInputs(service) && isSelected ? (
                              <div className="flex flex-col space-y-2 w-full">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4" />
                                  <input
                                    type="text"
                                    value={customServiceValues[service.id]?.duration || ''}
                                    onChange={(e) => handleCustomDurationChange(service.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Duration"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    value={customServiceValues[service.id]?.price || ''}
                                    onChange={(e) => handleCustomPriceChange(service.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Price"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                  />
                                </div>
                                {!isSelected && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleServiceToggle(service);
                                    }}
                                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                  >
                                    Add Service
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 mr-1" />
                                  {customServiceValues[service.id]?.duration || service.duration}
                                </span>
                                <span className="font-semibold text-blue-600">₹{customServiceValues[service.id]?.price || service.price}</span>
                              </>
                            )}
                          </div>
                          {shouldHaveCustomInputs(service) && !isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleServiceToggle(service);
                              }}
                              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              Add Service
                            </button>
                          )}
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: isRepeatServiceMode ? 1 : 1.2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRepeatServiceMode) handleServiceToggle(service);
                        }}
                      >
                        {isSelected ? (
                          <Minus className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 text-gray-400" />
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
                  {selectedServices.map((service) => {
                    const customPrice = customServiceValues[service.id]?.price;
                    return (
                      <div key={service.id} className="flex justify-between">
                        <span>{service.name}</span>
                        <span>₹{customPrice !== undefined ? customPrice : service.price}</span>
                      </div>
                    );
                  })}
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
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6 lg:ml-auto lg:max-w-xl"
          variants={cardVariants}
          custom={2}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-2 text-blue-600 dark:text-blue-400" />
            {t('schedule_service')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-1" />
                  {t('service_date')}
                </label>
                <motion.input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-1" />
                  {t('preferred_time')}
                </label>
                <motion.select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                >
                  {Array.from({ length: 26 }, (_, i) => {
                    const hour = 9 + Math.floor(i/2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-1" />
                  {t('customer_name')}
                </label>
                <motion.input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-1" />
                  {t('phone_number_form')}
                </label>
                <motion.input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-1" />
                  {t('email')}
                </label>
                <motion.input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  whileFocus={{ scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('additional_notes')}</label>
              <motion.textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 inline mr-2" />
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

    
    </motion.div>
  );
};