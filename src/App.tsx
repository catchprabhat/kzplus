import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Car as CarIcon, Calendar, MapPin, Wrench, Settings, ArrowRight, Star, Shield, Clock, Users, Menu, X, User, IndianRupee, Edit } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { CarCard } from './components/CarCard';
import { DatePicker } from './components/DatePicker';
import { BookingForm } from './components/BookingForm';
import { Calendar as CalendarView } from './components/Calendar';
import { BookingList } from './components/BookingList';
import { ServiceBooking } from './components/ServiceBooking';
import { ServiceBookingList } from './components/ServiceBookingList';
import { NotificationSettings } from './components/NotificationSettings';
import { OTPLoginForm } from './components/OTPLoginForm';
import { UserProfile } from './components/UserProfile';
import { ContactPage } from './components/ContactPage';
import { TermsAndConditions } from './components/TermsAndConditions';
import { SalePurchase } from './components/SalePurchase';
import { AdminPage } from './components/AdminPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ThemeToggle } from './components/ThemeToggle';
import { ComingSoon } from './components/ComingSoon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { cars } from './data/cars';
import { Car, Booking, ServiceBooking as ServiceBookingType } from './types';
import { useBookings } from './hooks/useBookings';
import { useCalendarBookings } from './hooks/useCalendarBookings';
import { useServiceBookings } from './hooks/useServiceBookings';
import { useAuth } from './hooks/useAuth';
import { SelfDriveBooking } from './components/SelfDriveBooking';
import { getAvailableCars, createCarBooking } from './services/api';

// Add API_BASE_URL constant
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


// Initialize FontAwesome library
library.add(fas);

// Custom service icons
const serviceIcons = [
  {
    id: 'Body Wash',
    name: 'Body Wash',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/one.svg"
          alt="Body Wash Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Full Wash',
    name: 'Full Wash',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/two.svg"
          alt="Full Wash Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Diesel Wash',
    name: 'Diesel Wash',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/three.svg"
          alt="Diesel Wash Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Hard Water Removal',
    name: 'Hard Water Removal',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/four.svg"
          alt="Hard Water Removal Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Head Light Restoration',
    name: 'Head Light Restoration',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/five.svg"
          alt="Head Light Restoration Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Wax Polish',
    name: 'Wax Polish',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/six.svg"
          alt="Wax Polish Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: '3 Step Polish',
    name: '3 Step Polish',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/seven.svg"
          alt="3 Step Polish Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Cermaic',
    name: 'Cermaic',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/eigth.svg"
          alt="Cermaic Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Graphene',
    name: 'Graphene',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/nine.svg"
          alt="Graphene Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'PPF',
    name: 'PPF',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/ten.svg"
          alt="PPF Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Periodic Maintenance',
    name: 'Periodic Maintenance',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/eleven.svg"
          alt="Periodic Maintenance Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Mechanic Work',
    name: 'Mechanic Work',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/twelve.svg"
          alt="Mechanic Work Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Tyre Change',
    name: 'Tyre Change',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/thirteen.svg"
          alt="Tyre Change Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Rim Restoration',
    name: 'Rim Restoration',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/fourteen.svg"
          alt="Rim Restoration Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Dent & Paint',
    name: 'Dent & Paint',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/fifteen.svg"
          alt="Dent & Paint Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Seat Cover',
    name: 'Seat Cover',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/sixteen.svg"
          alt="Seat Cover Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Ac vent Cleaning',
    name: 'Ac vent Cleaning',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/seventeen.svg"
          alt="Ac vent Cleaning Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Interior Cleaning',
    name: 'Interior Cleaning',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/eighteen.svg"
          alt="Interior Cleaning Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Accessories',
    name: 'Accessories',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/nineteen.svg"
          alt="Accessories Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  },
  {
    id: 'Others',
    name: 'Others',
    icon: (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
        <img
          src="/images/twenty.svg"
          alt="Others Icon"
          className="w-12 h-12 text-blue-600 dark:text-blue-400"
        />
      </div>
    )
  }
];

function App() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [dropDate, setDropDate] = useState('');
  const [comingSoonTitle, setComingSoonTitle] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [latestServiceBooking, setLatestServiceBooking] = useState<ServiceBookingType | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [serviceBookingLoading, setServiceBookingLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showServicesOverlay, setShowServicesOverlay] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>(cars);
  const [bookedCarIds, setBookedCarIds] = useState<string[]>([]);
  
  // Add page loading state
  const [pageLoading, setPageLoading] = useState(true);

  // Add ref for auto-scrolling to booking details
  const bookingDetailsRef = useRef<HTMLDivElement>(null);

  // Add new state for self-drive booking data
  const [selfDriveBookingData, setSelfDriveBookingData] = useState({
    location: 'Bangalore',
    tripStartDate: null as Date | null,
    tripEndDate: null as Date | null,
    startTime: { hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' },
    endTime: { hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' },
    deliveryPickup: false,
    deliveryAddress: '',
    nearbyLocation: '',
    pincode: '',
    googleMapsLocation: ''
  });

  // Add state to track intended destination before login
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Authentication
  const { user, loading: authLoading, isAuthenticated, login: originalLogin, logout, updateProfile } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current route from URL
  const getCurrentRoute = () => {
    const path = location.pathname;
    switch (path) {
      case '/': return 'home';
      case '/self-drive': return 'self-drive';
      case '/car-availability': return 'calendar';
      case '/my-trips': return 'bookings';
      case '/services': return 'services';
      case '/scheduled-services': return 'service-bookings';
      case '/buy-sell': return 'sale-purchase';
      case '/profile': return 'profile';
      case '/login': return 'login';
      case '/contact': return 'contact';
      case '/terms': return 'terms';
      case '/admin': return 'admin';
      case '/car-selection': return 'book';
      default: return 'home';
    }
  };
  
  const activeTab = getCurrentRoute();

  // Enhanced login function that handles post-login navigation
  const login = (userData: any) => {
    originalLogin(userData);
    
    // Navigate based on redirect or default to home
    if (redirectAfterLogin) {
      navigate(redirectAfterLogin);
      setRedirectAfterLogin(null);
    } else {
      navigate('/');
    }
  };

  const { 
    bookings, 
    loading, 
    fetchBookings, 
    createBooking, 
    updateBookingStatus, 
    deleteBooking 
  } = useBookings();

  // Add new hook for calendar that shows ALL bookings to everyone
  const { 
    bookings: calendarBookings, 
    loading: calendarLoading,
    refetch: refetchCalendarBookings
  } = useCalendarBookings();

  const {
    serviceBookings,
    loading: serviceLoading,
    fetchServiceBookings,
    createServiceBooking,
    updateServiceBookingStatus,
    deleteServiceBooking
  } = useServiceBookings();

  // Wrapper functions to adapt update status functions to return Promise<void>
  const handleUpdateBookingStatus = async (id: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<void> => {
    await updateBookingStatus(id, status);
    // Automatically refresh bookings data after successful status update
    await fetchBookings();
  };

  const handleUpdateServiceBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'): Promise<void> => {
    await updateServiceBookingStatus(id, status);
    // Automatically refresh service bookings data after successful status update
    await fetchServiceBookings();
  };

  // Function to calculate total hours
  const calculateTotalHours = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600));
  };

  // Function to fetch available cars
  const fetchAvailableCars = async (pickupDate: string, dropDate: string) => {
    try {
      const result = await getAvailableCars(pickupDate, dropDate);
      setBookedCarIds(result.bookedCarIds);
      
      // Show all cars instead of filtering out booked ones
      setAvailableCars(cars);
    } catch (error) {
      console.error('Error fetching available cars:', error);
      setAvailableCars(cars); // Fallback to all cars
    }
  };

  // Add useEffect for page loading
  useEffect(() => {
    // Show loading for 2 seconds on page load/refresh
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Update the effect when selfDriveBookingData changes
  useEffect(() => {
    if (selfDriveBookingData.tripStartDate && selfDriveBookingData.tripEndDate) {
      fetchAvailableCars(selfDriveBookingData.tripStartDate.toISOString(), selfDriveBookingData.tripEndDate.toISOString());
    }
  }, [selfDriveBookingData]);

  // Add loading overlay before the main return
  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/images/logo/iconnn.png" 
              alt="A Plus Auto Care" 
              className="w-24 h-24 mx-auto animate-pulse" 
            />
          </div>
          
          {/* Loading Spinner */}
          <div className="mb-6">
            <LoadingSpinner size="lg" text="" />
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">
              Loading your complete car solution...
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="bg-gray-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
          <p className="mt-4 text-gray-300">Fetching your personalized data</p>
        </div>
      </div>
    );
  }

  const handleCarSelect = (car: Car) => {
    setSelectedCar(selectedCar?.id === car.id ? null : car);
    
    // Auto-scroll to booking details when a car is selected
    if (selectedCar?.id !== car.id) { // Only scroll when selecting a new car, not deselecting
      setTimeout(() => {
        if (bookingDetailsRef.current) {
          bookingDetailsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100); // Small delay to ensure the booking form is rendered
    }
  };

  // Helper function to format date without timezone conversion
  const formatDateForDatabase = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleBookingComplete = async (booking: Booking) => {
    try {
      setBookingLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert('Please log in to make a booking.');
        setRedirectAfterLogin('/car-selection'); // Remember to redirect to book page after login
        navigate('/login'); // Redirect to login
        return;
      }
      
      // Find the selected car to get its type and seats
      const car = cars.find(c => c.id === booking.carId);
      
      // Helper function to format pickup location based on delivery option
      const formatPickupLocation = () => {
        if (selfDriveBookingData.deliveryPickup && selfDriveBookingData.deliveryAddress) {
          // Combine all address components when delivery is selected
          const addressParts = [
            selfDriveBookingData.deliveryAddress,
            selfDriveBookingData.nearbyLocation,
            selfDriveBookingData.pincode,
            selfDriveBookingData.googleMapsLocation,
          ].filter(part => part && part.trim() !== ''); // Remove empty parts
          
          return addressParts.length > 0 ? addressParts.join(', ') : selfDriveBookingData.location || 'Bangalore';
        }
        return selfDriveBookingData.location || 'Bangalore';
      };

      const enhancedBooking = {
        ...booking,
        carType: car?.type || 'Unknown',
        carSeats: car?.seats || 0,
        pickupLocation: formatPickupLocation(),
        deliveryPickup: selfDriveBookingData.deliveryPickup || false,
        totalHours: calculateTotalHours(new Date(booking.pickupDate), new Date(booking.dropDate)),
        pickupDate: formatDateForDatabase(booking.pickupDate),
        dropDate: formatDateForDatabase(booking.dropDate),
        // Use the edited email from the form for contact purposes; backend will store account email for ownership.
        userName: user?.name || booking.customerName,
        userEmail: booking.customerEmail,
        userPhone: booking.customerPhone
      };
      
      // Use createCarBooking with authentication
      const createdBooking = await createCarBooking(enhancedBooking);
      setLatestBooking(createdBooking);
      setLatestServiceBooking(null); // Clear service booking
      setShowConfirmation(true);
      
      // Add scroll to top functionality when booking is confirmed
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Refresh bookings list
      fetchBookings();

      // Refresh available cars before resetting dates
      if (pickupDate && dropDate) {
        fetchAvailableCars(pickupDate, dropDate);
      }
      
      // Reset form
      setSelectedCar(null);
      setPickupDate('');
      setDropDate('');
      
      // Redirect to My Trips page after successful booking
      navigate('/my-trips');
      
      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes('Authentication required')) {
        alert('Please log in to make a booking.');
        navigate('/profile');
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleServiceBookingComplete = async (serviceBooking: ServiceBookingType) => {
    try {
      setServiceBookingLoading(true);
      
      // Do not POST again here. PaymentPage already created the booking.
      setLatestServiceBooking(serviceBooking);
      setLatestBooking(null);
      setShowConfirmation(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      // Refresh the scheduled services list to include the newly created booking
      await fetchServiceBookings();

      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to handle service booking completion:', error);
    } finally {
      setServiceBookingLoading(false);
    }
  };

  const handleServiceBooking = async (bookingData: any) => {
    if (!isAuthenticated || !user) {
      alert('Please login to book a service');
      return;
    }

    try {
      // Find user in database to get user ID
      const userResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user profile');
      }

      const userProfile = await userResponse.json();
      
      const serviceBookingData = {
        userId: userProfile.id,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        services: bookingData.services,
        totalPrice: bookingData.totalPrice,
        notes: bookingData.notes || ''
      };

      await createServiceBooking(serviceBookingData);
      alert('Service booked successfully!');
    } catch (error) {
      console.error('Error booking service:', error);
      alert('Failed to book service. Please try again.');
    }
  };

  // Update navigation functions to use React Router
  const handleTabChange = (tab: any) => {
    // Check if user needs to be authenticated for this tab
    if (protectedRoutes.includes(tab) && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to the appropriate route
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'self-drive':
        navigate('/self-drive');
        break;
      case 'calendar':
        navigate('/car-availability');
        break;
      case 'bookings':
        navigate('/my-trips');
        break;
      case 'services':
        navigate('/services');
        break;
      case 'service-bookings':
        navigate('/scheduled-services');
        break;
      case 'sale-purchase':
        navigate('/buy-sell');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'terms':
        navigate('/terms');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'book':
        navigate('/car-selection');
        break;
      default:
        navigate('/');
        break;
    }
    
    setMobileMenuOpen(false);
    setShowServicesOverlay(false);
    
    // Refresh data based on the tab being switched to
    switch (tab) {
      case 'calendar':
        refetchCalendarBookings();
        break;
      case 'bookings':
        if (isAuthenticated) {
          fetchBookings();
        }
        break;
      case 'service-bookings':
        if (isAuthenticated) {
          fetchServiceBookings();
        }
        break;
      case 'self-drive':
        if (selfDriveBookingData.tripStartDate && selfDriveBookingData.tripEndDate) {
          fetchAvailableCars(selfDriveBookingData.tripStartDate.toISOString(), selfDriveBookingData.tripEndDate.toISOString());
        }
        break;
      default:
        break;
    }
    
    window.scrollTo(0, 0);
  };

  const handleServiceNavigation = (service: string) => {
    switch (service) {
      case 'car-services':
        navigate('/services');
        break;
      case 'self-drive':
        navigate('/self-drive');
        break;
      case 'sale-purchase':
        navigate('/buy-sell');
        break;
      default:
        break;
    }
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const handleAuthAction = (action: 'login' | 'logout') => {
    if (action === 'login') {
      // This will be handled by the login form
      navigate('/profile');
    } else {
      logout();
      navigate('/');
    }
    setMobileMenuOpen(false);
    setShowServicesOverlay(false); // Close services overlay on auth action
  };

  // Add handler for self-drive booking data
  const handleSelfDriveBookingData = (bookingData: any) => {
    setSelfDriveBookingData(bookingData);
    
    // Convert dates to the format expected by BookingForm
    if (bookingData.tripStartDate && bookingData.tripEndDate) {
      const startDateTime = new Date(bookingData.tripStartDate);
      startDateTime.setHours(
        bookingData.startTime.period === 'PM' && bookingData.startTime.hour !== 12 
          ? bookingData.startTime.hour + 12 
          : bookingData.startTime.hour === 12 && bookingData.startTime.period === 'AM'
          ? 0
          : bookingData.startTime.hour,
        bookingData.startTime.minute
      );
      
      const endDateTime = new Date(bookingData.tripEndDate);
      endDateTime.setHours(
        bookingData.endTime.period === 'PM' && bookingData.endTime.hour !== 12 
          ? bookingData.endTime.hour + 12 
          : bookingData.endTime.hour === 12 && bookingData.endTime.period === 'AM'
          ? 0
          : bookingData.endTime.hour,
        bookingData.endTime.minute
      );
      
      setPickupDate(startDateTime.toISOString());
      setDropDate(endDateTime.toISOString());
    }
    
    navigate('/car-selection');
  };

  const navigationItems = [
    { key: 'home', label: 'Home', icon: CarIcon, protected: false },
    { key: 'self-drive', label: 'Self-Drive', icon: CarIcon, protected: false },
    { key: 'calendar', label: 'Car Availability', icon: Calendar, protected: false },
    { key: 'bookings', label: 'My Trips', icon: Calendar, protected: true },
    { key: 'service-bookings', label: 'Scheduled Services', icon: Wrench, protected: true },
    { key: 'sale-purchase', label: 'Buy and Sell History', icon: CarIcon, protected: false }
  ];

  const protectedRoutes = ['bookings', 'service-bookings', 'settings', 'profile'];

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-300">
        {/* Services Overlay Modal */}
        {showServicesOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-md"
              onClick={() => setShowServicesOverlay(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowServicesOverlay(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Header */}
              <div className="text-center py-6 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Best Car & Bike Services
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Your Vehicle, Our Service!
                </p>
              </div>
              
              {/* Services Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {serviceIcons.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowServicesOverlay(false);
                      navigate('/services');
                    }}
                  >
                    {/* Service Icon */}
                    {service.icon}
                    
                    {/* Service Name */}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    
                    {/* New Tag for some services */}
                    {['car-inspections', 'windshields', 'clutch-body', 'insurance'].includes(service.id) && (
                      <span className="text-xs font-medium text-green-600 mt-1"></span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-dark-700">
                <button
                  onClick={() => {
                    setShowServicesOverlay(false);
                    navigate('/services');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
                >
                  Book Service Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Conditional Blur */}
        <div className={showServicesOverlay ? 'filter blur-sm' : ''}>
          {/* Header */}
          <header className="bg-white dark:bg-dark-800 shadow-sm border-b dark:border-dark-700 sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center cursor-pointer" onClick={() => handleTabChange('home')}>
                  <img 
                    src="/images/logo/iconnn.png" 
                    alt="A Plus Auto Care" 
                    className="w-20 h-20 mr-5" 
                  />
                </div>
                
                {/* Desktop Header Info & Auth - Navigation removed */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Theme Toggle */}
                  <ThemeToggle />
                  
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {user?.name}</span>
                      <button
                        onClick={() => handleTabChange('profile')}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 mr-1" />
                        Profile
                      </button>
                      <button
                        onClick={() => handleAuthAction('logout')}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAuthAction('login')}
                      className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </button>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Success Notification */}
          {showConfirmation && (latestBooking || latestServiceBooking) && (
            <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
              <div className="flex items-center">
                {latestBooking ? <CarIcon className="w-5 h-5 mr-2" /> : <Wrench className="w-5 h-5 mr-2" />}
                <div>
                  <h4 className="font-semibold">
                    {latestBooking ? '🚗 Booking Confirmed!' : '🔧 Service Booked!'}
                  </h4>
                  <p className="text-sm opacity-90">
                    {latestBooking 
                      ? `${latestBooking.carName} reserved for ${latestBooking.totalDays} day${latestBooking.totalDays !== 1 ? 's' : ''}`
                      : `${latestServiceBooking?.services?.length || 0} service${(latestServiceBooking?.services?.length || 0) !== 1 ? 's' : ''} scheduled for ${latestServiceBooking?.vehicleNumber}`
                    }
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    📧 Email & 📱 WhatsApp notifications sent!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Overlay */}
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
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  
                  {/* User Info */}
                  {isAuthenticated && user && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <nav className="space-y-2">
                    {navigationItems.map(({ key, label, icon: Icon, protected: isProtected }) => {
                      const isDisabled = isProtected && !isAuthenticated;
                      return (
                        <button
                          key={key}
                          onClick={() => !isDisabled && handleTabChange(key)}
                          disabled={isDisabled}
                          className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                            activeTab === key
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-black-800 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                              : isDisabled
                              ? 'text-gray-600 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-dark-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{label}</span>
                          {isProtected && !isAuthenticated && (
                            <span className="ml-auto text-xs bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                              Login Required
                            </span>
                          )}
                          {((key === 'bookings' && bookings.filter(booking => booking.status !== 'deleted').length > 0) || 
                            (key === 'service-bookings' && serviceBookings.filter(booking => booking.status !== 'deleted').length > 0)) && (
                            <span className="ml-auto bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                              {key === 'bookings' ? bookings.filter(booking => booking.status !== 'deleted').length : serviceBookings.filter(booking => booking.status !== 'deleted').length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    
                    {/* Auth Actions */}
                    <div className="border-t dark:border-dark-600 pt-4 mt-4">
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={() => handleTabChange('profile')}
                            className={`w-full flex items-center px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                              activeTab === 'profile'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                            }`}
                          >
                            <User className="w-5 h-5 mr-3" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => handleAuthAction('logout')}
                            className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <User className="w-5 h-5 mr-3" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAuthAction('login')}
                          className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-left bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          <User className="w-5 h-5 mr-3" />
                          <span>Login</span>
                        </button>
                      )}
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Navigation - Show on all pages including home */}
          <nav className="bg-white dark:bg-dark-800 border-b dark:border-dark-700 hidden md:block transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center space-x-8 overflow-x-auto">
                {navigationItems.map(({ key, label, icon: Icon, protected: isProtected }) => {
                  const isDisabled = isProtected && !isAuthenticated;
                  return (
                    <button
                      key={key}
                      onClick={() => !isDisabled && handleTabChange(key)}
                      disabled={isDisabled}
                      className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === key
                          ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                          : isDisabled
                          ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                     {isProtected && !isAuthenticated && (
                        <span className="ml-2 text-xs bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          Login Required
                        </span>
                      )}
                      {((key === 'bookings' && bookings.filter(booking => booking.status !== 'deleted').length > 0) || 
                        (key === 'service-bookings' && serviceBookings.filter(booking => booking.status !== 'deleted').length > 0)) && (
                        <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
                          {key === 'bookings' ? bookings.filter(booking => booking.status !== 'deleted').length : serviceBookings.filter(booking => booking.status !== 'deleted').length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Mobile Tab Bar - Always Visible */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t dark:border-dark-700 shadow-lg z-30 md:hidden transition-colors duration-300">
            <div className="grid grid-cols-5 gap-0 max-w-md mx-auto relative">
              {/* Slider indicator */}
              <div 
                className="absolute bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-in-out"
                style={{
                  left: activeTab === 'self-drive' ? '0%' :
                        activeTab === 'services' ? '20%' :
                        activeTab === 'sale-purchase' ? '40%' :
                        activeTab === 'contact' ? '60%' :
                        (activeTab === 'profile' || activeTab === 'login') ? '80%' : '0%',
                  width: '20%',
                  opacity: activeTab === 'home' ? 0 : 1
                }}
              />
              
              <button
                onClick={() => handleTabChange('self-drive')}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === 'self-drive' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
                }`}
              >
                <CarIcon className={`w-5 h-5 mb-1 transition-colors ${
                  activeTab === 'self-drive' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-blue-500 dark:text-blue-400'
                }`} />
                <span className="text-xs font-medium">Self-Drive</span>
              </button>
              
              <button
                onClick={() => handleServiceNavigation('car-services')}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === 'services' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300'
                }`}
              >
                <Wrench className={`w-5 h-5 mb-1 transition-colors ${
                  activeTab === 'services' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-green-500 dark:text-green-400'
                }`} />
                <span className="text-xs font-medium">Services</span>
              </button>
              
              <button
                onClick={() => handleServiceNavigation('sale-purchase')}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === 'sale-purchase' 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-300'
                }`}
              >
                <IndianRupee className={`w-5 h-5 mb-1 transition-colors ${
                  activeTab === 'sale-purchase' 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-purple-500 dark:text-purple-400'
                }`} />
                <span className="text-xs font-medium">Sale & Purchase</span>
              </button>
              
              <button
                onClick={() => handleTabChange('contact')}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === 'contact' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
                }`}
              >
                <MapPin className={`w-5 h-5 mb-1 transition-colors ${
                  activeTab === 'contact' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-indigo-500 dark:text-indigo-400'
                }`} />
                <span className="text-xs font-medium">Contact</span>
              </button>
              
              <button
                onClick={() => isAuthenticated ? handleTabChange('profile') : navigate('/login')}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  (activeTab === 'profile' || activeTab === 'login') 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-300'
                }`}
              >
                <User className={`w-5 h-5 mb-1 transition-colors ${
                  (activeTab === 'profile' || activeTab === 'login') 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-orange-500 dark:text-orange-400'
                }`} />
                <span className="text-xs font-medium">
                  {isAuthenticated ? 'Profile' : 'Login'}
                </span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8 pt-16`}>
            <Routes>
              <Route path="/" element={
                <div className="space-y-12 sm:space-y-16">
                  {/* Hero Section */}
                  <section className="text-center py-8 sm:py-12 md:py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl sm:rounded-2xl md:rounded-3xl"></div>
                    <div className="relative z-10 px-3 sm:px-4">
                      <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white mb-3 sm:mb-4 md:mb-6">
                        Your Complete
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline"> Car Solution</span>
                      </h1>
                      <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-500 dark:text-gray-500 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto">
                        From premium self-drive rentals to professional car services and seamless buying/selling - everything you need for your automotive journey.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-4">
                        <button
                          onClick={() => navigate('/self-drive')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:py-5 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <CarIcon className="w-5 h-5" />
                          <span>Self-Drive Car</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowServicesOverlay(true)}
                          className="bg-white hover:bg-white text-black px-8 py-3 sm:py-5 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Wrench className="w-5 h-5" />
                          <span>View All Car Services</span>
                        </button>
                        <button
                          onClick={() => navigate('/buy-sell')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 sm:py-5 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <IndianRupee className="w-5 h-5" />
                          <span>Car Sale & Purchase</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </section>
                                            
                  {/* Services Section */}
                  <section className="py-6 xs:py-8 sm:py-12 md:py-16">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                      <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Our Premium Services</h2>
                      <p className="text-base xs:text-lg sm:text-xl text-gray-500 dark:text-gray-500 max-w-2xl mx-auto px-3 sm:px-4">
                        Comprehensive automotive solutions designed to meet all your car-related needs
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8 px-3 sm:px-4 md:px-6">
                      {/* Car Services */}
                      <div className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                          <img 
                            src="https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Car Services"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <Wrench className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                          </div>
                        </div>
                        <div className="p-6 sm:p-8">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Car & Bike Services</h3>
                          <p className="text-gray-600 dark:text-gray-500 mb-6 text-sm sm:text-base">
                            Professional maintenance, detailing, and repair services for your vehicle. 
                            From basic wash to ceramic coating and mechanical repairs.
                          </p>
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Shield className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-green-500" />
                              Professional certified technicians
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-blue-500" />
                              Quick turnaround time
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-yellow-500" />
                              Premium quality service
                            </div>
                          </div>
                          <button
                            onClick={() => setShowServicesOverlay(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center group"
                          >
                            Book Service
                            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Self-Drive Car Rental */}
                      <div className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                          <img 
                            src="https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Self-Drive Car Rental"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <CarIcon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                          </div>
                        </div>
                        <div className="p-6 sm:p-8">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Self-Drive Car Rental</h3>
                          <p className="text-gray-600 dark:text-gray-500 mb-6 text-sm sm:text-base">
                            Premium fleet of well-maintained vehicles for your self-drive adventures. 
                            From economy to luxury cars, find the perfect ride for any occasion.
                          </p>
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Users className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-blue-500" />
                              Wide range of vehicles
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Shield className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-green-500" />
                              Fully insured & sanitized
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-purple-500" />
                              24/7 roadside assistance
                            </div>
                          </div>
                          <button
                            onClick={() => handleServiceNavigation('self-drive')}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center group"
                          >
                            Book Self-Drive
                            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Sale/Purchase */}
                      <div className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden md:col-span-2 lg:col-span-1">
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                          <img 
                            src="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Car Sale Purchase"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <CarIcon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                          </div>
                        </div>
                        <div className="p-6 sm:p-8">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Sale / Purchase</h3>
                          <p className="text-gray-600 dark:text-gray-500 mb-6 text-sm sm:text-base">
                            Seamless car buying and selling experience with verified listings, 
                            fair pricing, and complete documentation assistance.
                          </p>
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Shield className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-green-500" />
                              Verified listings & sellers
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-yellow-500" />
                              Fair market pricing
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Users className="w-3 sm:w-4 h-3 sm:h-4 mr-2 text-blue-500" />
                              Complete documentation help
                            </div>
                          </div>
                          <button
                            onClick={() => handleServiceNavigation('sale-purchase')}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center group"
                          >
                            Sale and purchase

                            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Features Section */}
                  <section className="py-12 sm:py-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-dark-800 dark:to-dark-700 rounded-2xl sm:rounded-3xl transition-colors duration-300">
                    <div className="text-center mb-12 sm:mb-16 px-4">
                      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose A plus auto care?</h2>
                      <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-500 max-w-2xl mx-auto">
                        We're committed to providing exceptional automotive solutions with unmatched service quality
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4">
                      <div className="text-center p-4 sm:p-6">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Trusted & Secure</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Fully verified services with comprehensive insurance coverage</p>
                      </div>

                      <div className="text-center p-4 sm:p-6">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Round-the-clock customer support and roadside assistance</p>
                      </div>

                      <div className="text-center p-4 sm:p-6">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Star className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Premium Quality</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">High-quality vehicles and professional service standards</p>
                      </div>

                      <div className="text-center p-4 sm:p-6">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Users className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer First</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Personalized service tailored to your specific needs</p>
                      </div>
                    </div>
                  </section>

                  {/* CTA Section */}
                  <section className="text-center py-12 sm:py-16">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
                      <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
                      <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
                        Join thousands of satisfied customers who trust A plus auto care for their automotive needs
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => handleServiceNavigation('self-drive')}
                          className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all transform hover:scale-105 flex items-center justify-center"
                        >
                          <CarIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                          Start Booking
                        </button>
                        <button
                          onClick={() => handleTabChange('contact')}
                          className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all transform hover:scale-105 flex items-center justify-center"
                        >
                          <MapPin className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                          Contact Us
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              } />
              
              <Route path="/self-drive" element={
                <SelfDriveBooking 
                  onBookingComplete={handleBookingComplete}
                  onNavigateToCarSelection={handleSelfDriveBookingData}
                  initialBookingData={selfDriveBookingData}
                />
              } />
              
              <Route path="/car-availability" element={
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Car Availability</h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-500">
                      View all car bookings in a monthly calendar format with color-coded vehicle types
                    </p>
                  </div>
                  {calendarLoading ? (
                    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
                      <LoadingSpinner size="lg" text="Loading calendar..." />
                    </div>
                  ) : (
                    <CalendarView bookings={calendarBookings} />
                  )}
                </div>
              } />
              
              <Route path="/my-trips" element={
                isAuthenticated ? (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">My Bookings</h2>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        Manage and view your car reservations
                      </p>
                    </div>
                    <ErrorBoundary>
                      <BookingList 
                        bookings={bookings} 
                        loading={loading}
                        onUpdateStatus={handleUpdateBookingStatus}
                        onDelete={deleteBooking}
                      />
                    </ErrorBoundary>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Authentication Required</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Please log in to view your bookings.</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )
              } />
              
              <Route path="/services" element={
                <ServiceBooking
                  onServiceBookingComplete={handleServiceBookingComplete}
                  loading={serviceBookingLoading}
                />
              } />
              
              <Route path="/scheduled-services" element={
                isAuthenticated ? (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Service Bookings</h2>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                        Manage and view all your car service appointments
                      </p>
                    </div>
                    <ServiceBookingList
                      bookings={serviceBookings}
                      loading={serviceLoading}
                      onUpdateStatus={handleUpdateServiceBookingStatus}
                      onDelete={deleteServiceBooking}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8 text-center">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Authentication Required</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Please log in to view your service bookings.</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )
              } />
              
              <Route path="/buy-sell" element={<SalePurchase />} />
              
              <Route path="/contact" element={<ContactPage />} />
              
              <Route path="/terms" element={<TermsAndConditions />} />
              
              <Route path="/profile" element={
                isAuthenticated && user ? (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">User Profile</h2>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        Manage your account information and preferences
                      </p>
                    </div>
                    <UserProfile 
                      user={user} 
                      onLogout={logout} 
                      onUpdateProfile={updateProfile}
                    />
                  </div>
                ) : (
                  <OTPLoginForm onLogin={login} />
                )
              } />
              
              <Route path="/login" element={
                <OTPLoginForm onLogin={login} />
              } />
              
              <Route path="/admin" element={
                <AdminPage onBackToHome={() => navigate('/')} />
              } />
              
              <Route path="/car-selection" element={
                <div>
                  <div className="text-center mb-8">
                    {/* Promotional Banner */}
                    <div className="bg-blue-500 text-white p-4 rounded-lg mb-4 mx-auto max-w-4xl">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        🚗 Drive More, Save More! Enjoy 20% OFF exclusively for our regular customers on our monthly subscription program
                      </h2>
                    </div>
                    
                    {/* Show booking summary */}
                    {selfDriveBookingData.tripStartDate && selfDriveBookingData.tripEndDate && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-dark-700 rounded-lg inline-block relative">
                        <div className="text-sm text-black-700 dark:text-black-300">
                          <div className="font-bold mb-1">
                            📍 <strong>Trip:</strong> {selfDriveBookingData.location}
                          </div>
                          <div>
                            {selfDriveBookingData.tripStartDate.toLocaleDateString()} {selfDriveBookingData.startTime.hour}:{selfDriveBookingData.startTime.minute.toString().padStart(2, '0')} {selfDriveBookingData.startTime.period} - {selfDriveBookingData.tripEndDate.toLocaleDateString()} {selfDriveBookingData.endTime.hour}:{selfDriveBookingData.endTime.minute.toString().padStart(2, '0')} {selfDriveBookingData.endTime.period}
                          </div>
                        </div>
                        {/* Edit button */}
                        <button
                          onClick={() => navigate('/self-drive')}
                          className="absolute top-2 right-2 p-2 hover:bg-blue-100 dark:hover:bg-dark-600 rounded-full transition-colors group"
                          title="Edit dates and times"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-8">
                    {/* Car Selection */}
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {availableCars.map(car => (
                          <CarCard
                            key={car.id}
                            car={car}
                            onSelect={handleCarSelect}
                            isSelected={selectedCar?.id === car.id}
                            isBooked={bookedCarIds.includes(car.id)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Show Booking Form only when car is selected, dates are available, and user is authenticated */}
                    {selectedCar && pickupDate && dropDate && (
                      <div ref={bookingDetailsRef} className="max-w-md mx-auto">
                        {isAuthenticated ? (
                          <BookingForm
                            selectedCar={selectedCar}
                            pickupDate={pickupDate}
                            dropDate={dropDate}
                            onBookingComplete={handleBookingComplete}
                            loading={bookingLoading}
                            onNavigate={handleTabChange}
                          />
                        ) : (
                          <div className="text-center py-8 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Authentication Required</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Please log in to make a booking. This ensures your bookings are saved to your account.</p>
                            <button
                              onClick={() => {
                                setRedirectAfterLogin('/car-selection'); // Remember to redirect back to car selection
                                navigate('/login');
                              }}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Go to Login
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Show message if no dates selected */}
                    {(!pickupDate || !dropDate) && (
                      <div className="text-center p-8 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300">
                          Please select your trip dates from the booking page first.
                        </p>
                        <button
                          onClick={() => navigate('/self-drive')}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Go to Booking Page
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              } />
              
              {/* Catch all route for 404 */}
              <Route path="*" element={
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Go Home
                  </button>
                </div>
              } />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-dark-950 text-white mt-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center mb-4">
                    <CarIcon className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold">A plus auto care</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your trusted partner for premium self-drive car rentals, professional car services, and automotive marketplace solutions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Services</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>Self-Drive Rentals</li>
                    <li>Car Maintenance</li>
                    <li>Detailing Services</li>
                    <li>Car Marketplace</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>Help Center</li>
                    <li>
                      <button 
                        onClick={() => handleTabChange('contact')}
                        className="hover:text-white transition-colors"
                      >
                        Contact Us
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleTabChange('terms')}
                        className="hover:text-white transition-colors"
                      >
                        Terms & Conditions
                      </button>
                    </li>
                    <li>Privacy Policy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>+917735537655 - Self drive</li>
                    <li>+918050922920 - Tyre care and mechanic work</li>
                    <li>+918123540767 - Others</li>
                    <li>
                      <a 
                        href="https://maps.app.goo.gl/auGNQh4kqViej7Hr5?g_st=aw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                      >
                        Click here for Location
                      </a>
                    </li>
                    <li>kzplusmotors@gmail.com</li>
                    <li>Available 24/7</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 dark:border-dark-700 mt-8 pt-8 text-center text-gray-400">
                <p>© 2025 A plus auto care. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;