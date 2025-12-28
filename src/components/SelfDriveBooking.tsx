import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Car, ChevronLeft, ChevronRight, Check, CheckCircle, CreditCard, MessageCircle, Mail, CarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cars } from '../data/cars';

interface SelfDriveBookingProps {
  onBookingComplete?: (booking: any) => void;
  onNavigateToCarSelection?: (bookingData: any) => void;
  initialBookingData?: any;
}

export const SelfDriveBooking: React.FC<SelfDriveBookingProps> = ({
  onBookingComplete,
  onNavigateToCarSelection,
  initialBookingData
}) => {
  const [location, setLocation] = useState('Bangalore');
  const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
  const [tripEndDate, setTripEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [endTime, setEndTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [deliveryPickup, setDeliveryPickup] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [nearbyLocation, setNearbyLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [googleMapsLocation, setGoogleMapsLocation] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Add the missing ref
  const timeSelectionRef = useRef<HTMLDivElement>(null);
  
  // Initialize state with existing booking data if available
  useEffect(() => {
    if (initialBookingData) {
      setLocation(initialBookingData.location || 'Bangalore');
      setTripStartDate(initialBookingData.tripStartDate ? new Date(initialBookingData.tripStartDate) : null);
      setTripEndDate(initialBookingData.tripEndDate ? new Date(initialBookingData.tripEndDate) : null);
      setStartTime(initialBookingData.startTime || { hour: 9, minute: 0, period: 'AM' });
      setEndTime(initialBookingData.endTime || { hour: 9, minute: 0, period: 'AM' });
      setDeliveryPickup(initialBookingData.deliveryPickup || false);
      setDeliveryAddress(initialBookingData.deliveryAddress || '');
      setNearbyLocation(initialBookingData.nearbyLocation || '');
      setPincode(initialBookingData.pincode || '');
      setGoogleMapsLocation(initialBookingData.googleMapsLocation || '');
    }
  }, [initialBookingData]);
  
  // Update the handleDateSelect function
  const handleDateSelect = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (selectingStartDate) {
      setTripStartDate(date);
      
      // If the current end date is before the new start date, reset it
      if (tripEndDate && tripEndDate < date) {
        setTripEndDate(null);
      }
      
      // If today is selected, set start time to current time + 1 hour
      if (isToday) {
        const now = new Date();
        const nextHour = Math.min(now.getHours() + 1, 12); // Limit to 12 for 12-hour format
        const period = now.getHours() + 1 >= 12 ? 'PM' : 'AM';
        const adjustedHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
        
        setStartTime({
          hour: adjustedHour,
          minute: 0,
          period: period
        });
      }
      
      setSelectingStartDate(false);
    } else {
      // Only allow selecting end date if it's on or after the start date
      if (tripStartDate && date >= tripStartDate) {
        setTripEndDate(date);
        setSelectingStartDate(true);
        
        // Auto-scroll to time selection when both dates are selected
        setTimeout(() => {
          if (timeSelectionRef.current) {
            timeSelectionRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 300);
      }
    }
  };

  // Add function to generate available time options based on selected date
  const generateTimeOptions = (type: 'start' | 'end', selectedDate: Date | null) => {
    const options = [];
    const today = new Date();
    const isToday = selectedDate?.toDateString() === today.toDateString();
    
    if (type === 'start' && isToday) {
      // For start time on today, only show times after current time + 1 hour
      const minHour = Math.min(today.getHours() + 1, 23);
      const currentPeriod = minHour >= 12 ? 'PM' : 'AM';
      const adjustedMinHour = minHour > 12 ? minHour - 12 : minHour === 0 ? 12 : minHour;
      
      // Generate hours from minimum hour to 12
      for (let hour = adjustedMinHour; hour <= 12; hour++) {
        options.push({ value: hour, period: currentPeriod });
      }
      
      // If we're in AM and there's room, add PM hours
      if (currentPeriod === 'AM') {
        for (let hour = 1; hour <= 12; hour++) {
          options.push({ value: hour, period: 'PM' });
        }
      }
    } else {
      // Normal time options
      for (let hour = 1; hour <= 12; hour++) {
        options.push({ value: hour, period: 'AM' });
        options.push({ value: hour, period: 'PM' });
      }
    }
    
    return options;
  };

  const handleTimeChange = (type: 'start' | 'end', field: 'hour' | 'minute' | 'period', value: any) => {
    if (type === 'start') {
      setStartTime(prev => ({ ...prev, [field]: value }));
    } else {
      setEndTime(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === monthIndex,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleSearch = () => {
    if (!tripStartDate || !tripEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Save booking data and navigate to car selection
    const bookingData = {
      location,
      tripStartDate,
      tripEndDate,
      startTime,
      endTime,
      deliveryPickup,
      deliveryAddress,
      nearbyLocation,
      pincode,
      googleMapsLocation

    };
    
    if (onNavigateToCarSelection) {
      onNavigateToCarSelection(bookingData);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full sm:max-w-2xl md:max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-3 sm:p-4 lg:p-6">
      {/* Header - Mobile Responsive */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 px-2">
          Looking for Best Car Rentals?
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-400 mb-2 px-2">
          Book Self-Drive Cars in <span className="text-blue-600">Bangalore</span>
        </h2>
      </div>
                        {/* How Booking Works */}
                        <section className="py-12 sm:py-16">
                    <div className="text-center mb-12 sm:mb-16 px-4">
                      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">How Booking Works</h2>
                      <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-500 max-w-2xl mx-auto">
                        Simple, secure, and fast. Complete your booking in a few easy steps
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 px-4">
                      {/* Step 1 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Mail className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Login via Email</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Secure OTP-based login with your email address</p>
                      </div>

                      {/* Step 2 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Calendar className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Choose Your Dates</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Pick trip start and end with preferred times</p>
                      </div>

                      {/* Step 3 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <CarIcon className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Car</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Browse and choose from our curated fleet</p>
                      </div>

                      {/* Step 4 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Mail className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Confirmation</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Get booking details instantly in your inbox</p>
                      </div>

                      {/* Step 5 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">WhatsApp for Documents</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Receive a link on WhatsApp to upload your ID</p>
                      </div>

                      {/* Step 6 */}
                      <div className="text-center p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-2xl shadow">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <CreditCard className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Pay Advance</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">Complete advance payment to confirm booking</p>
                      </div>
                    </div>

                    <div className="text-center mt-10">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Booking confirmed after payment and document verification
                      </div>
                    </div>
                  </section>

                  {/* CTA Section */}
      {/* Main Booking Card - Mobile Responsive */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
        {/* Location - Mobile Responsive */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            readOnly
            className="w-full p-3 sm:p-4 text-sm sm:text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
          />
        </div>

        {/* Date Selection - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Starts
            </label>
            <button
              onClick={() => {
                setSelectingStartDate(true);
                setShowCalendar(true);
              }}
              className="w-full p-3 sm:p-4 border border-gray-300 dark:border-dark-600 rounded-lg text-left focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
              <span className="text-sm sm:text-base font-medium truncate pr-2">
                {tripStartDate ? formatDateOnly(tripStartDate) : getDefaultStartDisplay()}
              </span>
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-white-600" />
            </button>
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Ends
            </label>
            <button
              onClick={() => {
                setSelectingStartDate(false);
                setShowCalendar(true);
              }}
              className="w-full p-3 sm:p-4 border border-gray-300 dark:border-dark-600 rounded-lg text-left focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
              <span className="text-sm sm:text-base font-medium truncate pr-2">
                {tripEndDate ? formatDateOnly(tripEndDate) : getDefaultEndDisplay()}
              </span>
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-white-600" />
            </button>
          </div>
        </div>

        {/* Delivery & Pickup Checkbox */}
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deliveryPickup}
              onChange={(e) => setDeliveryPickup(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Home Delivery
            </span>
          </label>
        </div>

        {/* Delivery Address Form */}
        <AnimatePresence>
          {deliveryPickup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300"
                  placeholder="Enter your address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nearby Location
                </label>
                <input
                  type="text"
                  value={nearbyLocation}
                  onChange={(e) => setNearbyLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300"
                  placeholder="Enter nearby landmark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300"
                  placeholder="Enter pincode"
                />
              </div>
              <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Google Maps Location
    </label>
    <input
      type="text"
      value={googleMapsLocation}
      onChange={(e) => setGoogleMapsLocation(e.target.value)}
      className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-gray-300"
      placeholder="Enter your Google Maps location link"
    />
  </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Button - Mobile Responsive */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          SEARCH
        </button>
      </div>

      {/* Car Showcase Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Our Fleet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Choose from our premium collection of self-drive cars
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
          {cars.map((car) => (
            <div 
              key={car.id} 
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="relative">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h4 className="text-white font-bold text-lg sm:text-xl">
                    {car.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-white/90 text-sm">
                      {car.seats} Seats
                    </span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/90 text-sm">
                      {car.type}
                    </span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/90 text-sm">
                      {car.fuel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Monthly subscription
                    </p>
                    <p className="text-gray-800 dark:text-gray-300 font-semibold">
                      ₹{car.subscription}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Per hour
                    </p>
                    <p className="text-gray-800 dark:text-gray-300 font-semibold">
                      ₹{car.pricePerHour}/hr
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                     Rental starting from
                    </p>
                    <p className="text-blue-600 font-bold text-lg">
                      ₹{car.pricePerDay}/day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Popup */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-lg font-semibold text-black-900 dark:text-gray-300">
                  {tripStartDate && tripEndDate ? (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="block sm:inline">
                        {formatDate(tripStartDate)}
                      </span>
                      <span className="hidden sm:inline mx-2"> - </span>
                      <span className="block sm:inline">
                        {formatDate(tripEndDate)}
                      </span>
                    </div>
                  ) : selectingStartDate ? (
                    'Select start date'
                  ) : (
                    'Select end date'
                  )}
                </div>
                <button
                  onClick={() => {
                    setTripStartDate(null);
                    setTripEndDate(null);
                    setSelectingStartDate(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  RESET
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Month */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(currentMonth).map((day, index) => {
                      const isSelected = (tripStartDate && day.date.toDateString() === tripStartDate.toDateString()) ||
                                       (tripEndDate && day.date.toDateString() === tripEndDate.toDateString());
                      const isInRange = tripStartDate && tripEndDate &&
                                      day.date >= tripStartDate && day.date <= tripEndDate;
                      
                      // Disable dates before start date when selecting end date
                      const isDisabled = (day.date < new Date() && !day.isToday) ||
                                       (!selectingStartDate && tripStartDate && day.date < tripStartDate);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={isDisabled}
                          className={`
                            p-2 text-sm rounded transition-colors
                            ${
                              !day.isCurrentMonth
                                ? 'text-gray-300 dark:text-gray-600'
                                : isDisabled
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white'
                                : isInRange
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : day.isToday
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-900 dark:text-gray-300'
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Month */}
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                      {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)).map((day, index) => {
                      const isSelected = (tripStartDate && day.date.toDateString() === tripStartDate.toDateString()) ||
                                       (tripEndDate && day.date.toDateString() === tripEndDate.toDateString());
                      const isInRange = tripStartDate && tripEndDate &&
                                      day.date >= tripStartDate && day.date <= tripEndDate;
                      
                      // Disable dates before start date when selecting end date
                      const isDisabled = (day.date < new Date() && !day.isToday) ||
                                       (!selectingStartDate && tripStartDate && day.date < tripStartDate);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={isDisabled}
                          className={`
                            p-2 text-sm rounded transition-colors
                            ${
                              !day.isCurrentMonth
                                ? 'text-gray-300 dark:text-gray-600'
                                : isDisabled
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white'
                                : isInRange
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : day.isToday
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-900 dark:text-gray-300'
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selection with highlight effect */}
              <div 
                ref={timeSelectionRef} 
                className="mt-8"
              >
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">
                  Select the start time & end time
                </h4>
                
                {/* Start Time */}
                // Start Time section (wrap controls on mobile)
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={startTime.hour}
                        onChange={(e) => handleTimeChange('start', 'hour', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        {(() => {
                          const today = new Date();
                          const isToday = tripStartDate?.toDateString() === today.toDateString();
                          const minHour = isToday ? Math.min(today.getHours() + 1, 23) : 1;
                          const startHour = isToday && minHour > 12 ? minHour - 12 : isToday && minHour === 0 ? 12 : isToday ? minHour : 1;
                          const maxHour = 12;
                          
                          return Array.from({ length: maxHour - startHour + 1 }, (_, i) => startHour + i).map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                          ));
                        })()}
                      </select>
                      <span className="text-gray-500">:</span>
                      <select
                        value={startTime.minute}
                        onChange={(e) => handleTimeChange('start', 'minute', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={startTime.period}
                        onChange={(e) => handleTimeChange('start', 'period', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        {(() => {
                          const today = new Date();
                          const isToday = tripStartDate?.toDateString() === today.toDateString();
                          const options = [];
                          
                          if (!isToday || today.getHours() < 12) {
                            options.push(<option key="AM" value="AM">AM</option>);
                          }
                          if (!isToday || today.getHours() >= 11) {
                            options.push(<option key="PM" value="PM">PM</option>);
                          }
                          
                          return options;
                        })()}
                      </select>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {formatTime(startTime)}
                    </div>
                  </div>
                </div>

                {/* End Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={endTime.hour}
                        onChange={(e) => handleTimeChange('end', 'hour', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">:</span>
                      <select
                        value={endTime.minute}
                        onChange={(e) => handleTimeChange('end', 'minute', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={endTime.period}
                        onChange={(e) => handleTimeChange('end', 'period', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-300"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {formatTime(endTime)}
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => setShowCalendar(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  CONTINUE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

  // Helper functions for formatting
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Convert full day names to abbreviated forms
    const dayAbbreviations: { [key: string]: string } = {
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thurs',
      'Friday': 'Fri',
      'Saturday': 'Sat'
    };
    
    const abbreviatedDay = dayAbbreviations[weekday] || weekday;
    
    return `${month} ${day}' ${year} , ${abbreviatedDay}`;
  };

  const formatTime = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    const minuteStr = time.minute.toString().padStart(2, '0');
    return `${time.hour}:${minuteStr} ${time.period}`;
  };

  const formatDateOnly = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
    return `${dateStr}, ${day}`;
  };

  const getDefaultStartDisplay = () => {
    return 'Select start date';
  };

  const getDefaultEndDisplay = () => {
    return 'Select end date';
  };