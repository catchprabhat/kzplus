import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Car, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelfDriveBookingProps {
  onBookingComplete?: (booking: any) => void;
  onNavigateToCarSelection?: (bookingData: any) => void;
}

export const SelfDriveBooking: React.FC<SelfDriveBookingProps> = ({ 
  onBookingComplete, 
  onNavigateToCarSelection 
}) => {
  const [location, setLocation] = useState('Bangalore');
  const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
  const [tripEndDate, setTripEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState({ hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [endTime, setEndTime] = useState({ hour: 12, minute: 0, period: 'AM' as 'AM' | 'PM' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [deliveryPickup, setDeliveryPickup] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [nearbyLocation, setNearbyLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [googleMapsLocation, setGoogleMapsLocation] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      weekday: 'short'
    });
  };

  const formatTime = (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.period}`;
  };

  const handleDateSelect = (date: Date) => {
    if (selectingStartDate) {
      setTripStartDate(date);
      setSelectingStartDate(false);
    } else {
      setTripEndDate(date);
      setSelectingStartDate(true);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Looking for Best Car Rentals?
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-400 mb-2">

          Book Self-Drive Cars in <span className="text-blue-600">Bangalore</span>
        </h2>
      </div>

      {/* Main Booking Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 mb-8">
        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            readOnly
            className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-black cursor-not-allowed"
          />
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Starts
            </label>
            <button
              onClick={() => {
                setSelectingStartDate(true);
                setShowCalendar(true);
              }}
              className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg text-left focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black flex items-center justify-between"
            >
              <span>{tripStartDate ? `${formatDate(tripStartDate)}, ${formatTime(startTime)}` : '2 Sep\'25, 9 PM'}</span>
              <Calendar className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Ends
            </label>
            <button
              onClick={() => {
                setSelectingStartDate(false);
                setShowCalendar(true);
              }}
              className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg text-left focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black flex items-center justify-between"
            >
              <span>{tripEndDate ? `${formatDate(tripEndDate)}, ${formatTime(endTime)}` : '4 Sep\'25, 9 PM'}</span>
              <Calendar className="w-5 h-5" />
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
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black"
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
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black"
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
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black"
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
      className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-black"
      placeholder="Enter your Google Maps location link"
    />
  </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          SEARCH
        </button>
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
                <div className="text-lg font-semibold text-black-900 dark:text-black">
                  {tripStartDate && tripEndDate ? (
                    `${formatDate(tripStartDate)} - ${formatDate(tripEndDate)}`
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(currentMonth).map((day, index) => {
                      const isSelected = (tripStartDate && day.date.toDateString() === tripStartDate.toDateString()) ||
                                       (tripEndDate && day.date.toDateString() === tripEndDate.toDateString());
                      const isInRange = tripStartDate && tripEndDate &&
                                      day.date >= tripStartDate && day.date <= tripEndDate;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={day.date < new Date() && !day.isToday}
                          className={`
                            p-2 text-sm rounded transition-colors
                            ${
                              !day.isCurrentMonth
                                ? 'text-gray-300 dark:text-gray-600'
                                : day.date < new Date() && !day.isToday
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white'
                                : isInRange
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : day.isToday
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-900 dark:text-black'
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
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
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={day.date < new Date() && !day.isToday}
                          className={`
                            p-2 text-sm rounded transition-colors
                            ${
                              !day.isCurrentMonth
                                ? 'text-gray-300 dark:text-gray-600'
                                : day.date < new Date() && !day.isToday
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white'
                                : isInRange
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : day.isToday
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-900 dark:text-black'
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

              {/* Time Selection */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-black mb-4">
                  Select the start time & end time
                </h4>
                
                {/* Start Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={startTime.hour}
                        onChange={(e) => handleTimeChange('start', 'hour', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">:</span>
                      <select
                        value={startTime.minute}
                        onChange={(e) => handleTimeChange('start', 'minute', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={startTime.period}
                        onChange={(e) => handleTimeChange('start', 'period', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
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
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">:</span>
                      <select
                        value={endTime.minute}
                        onChange={(e) => handleTimeChange('end', 'minute', parseInt(e.target.value))}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        value={endTime.period}
                        onChange={(e) => handleTimeChange('end', 'period', e.target.value)}
                        className="p-2 border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-black"
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
