import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Car, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Booking, CalendarDay } from '../types';

interface CalendarProps {
  bookings: Booking[];
}

export const Calendar: React.FC<CalendarProps> = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        bookings: getBookingsForDate(dayDate)
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        bookings: getBookingsForDate(dayDate)
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        bookings: getBookingsForDate(dayDate)
      });
    }

    return days;
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(booking => {
      // Ensure dates are properly parsed as Date objects
      const bookingStart = new Date(booking.pickupDate);
      const bookingEnd = new Date(booking.dropDate);
      
      // Normalize all dates to start of day for comparison
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDate = new Date(bookingStart.getFullYear(), bookingStart.getMonth(), bookingStart.getDate());
      const endDate = new Date(bookingEnd.getFullYear(), bookingEnd.getMonth(), bookingEnd.getDate());
      
      // Check if the date falls within the booking period (inclusive)
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  const isPickupDate = (date: Date, booking: Booking): boolean => {
    const pickupDate = new Date(booking.pickupDate);
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDate = new Date(pickupDate.getFullYear(), pickupDate.getMonth(), pickupDate.getDate());
    return targetDate.getTime() === startDate.getTime();
  };

  const isDropDate = (date: Date, booking: Booking): boolean => {
    const dropDate = new Date(booking.dropDate);
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(dropDate.getFullYear(), dropDate.getMonth(), dropDate.getDate());
    return targetDate.getTime() === endDate.getTime();
  };

  const formatDateTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBookingColor = (booking: Booking): string => {
    // Color coding based on vehicle type and seats
    if (booking.carType === 'Electric') {
      return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600';
    } else if (booking.carSeats === 7) {
      return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600';
    } else if (booking.carSeats === 5) {
      return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const getPickupDropColor = (booking: Booking, isPickup: boolean, isDrop: boolean): string => {
    const seats = getCarSeats(booking.carName); // Use the shared helper function
    
    if (isPickup && isDrop) {
      // Same day pickup and drop - use purple
      return 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-600';
    } else if (isPickup) {
      // Pickup day - use darker shade
      if (booking.carType === 'Electric') {
        return 'bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 border-green-300 dark:border-green-500';
      } else if (seats === 7) {
        return 'bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100 border-red-300 dark:border-red-500';
      } else if (seats === 5) {
        return 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-500';
      }
    } else if (isDrop) {
      // Drop day - use lighter shade with different pattern
      if (booking.carType === 'Electric') {
        return 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600';
      } else if (seats === 7) {
        return 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600';
      } else if (seats === 5) {
        return 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600';
      }
    }
    
    return getCarBarColor(booking); // Use the new function as fallback
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);

  // Add this function INSIDE the component, before the return statement
  // Add a shared helper function at the top level
  const getCarSeats = (carName: string): number => {
    const carSeatsMap: { [key: string]: number } = {
      'Innova Crysta': 7,
      'Tata Safari 2023': 7,
      'Duster': 5,
      'Baleno': 5,
      'Polo': 5,
      'Glanza': 5
    };
    return carSeatsMap[carName] || 5; // Default to 5 seats if not found
  };

  // Remove or modify the getDateBackgroundColor function to always return neutral background
  const getDateBackgroundColor = (dayBookings: Booking[]): string => {
    // Always return empty string to keep normal cell background
    return '';
  };

  // Add a new function to get individual car bar colors
  const getCarBarColor = (booking: Booking): string => {
    const seats = getCarSeats(booking.carName);
    
    // Color coding based on vehicle type and seats for individual bars
    if (booking.carType === 'Electric') {
      return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600';
    } else if (seats === 7) {
      return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600';
    } else if (seats === 5) {
      return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600';
    } else {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 sm:p-6">
      {/* Responsive header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Booking Calendar</span>
          <span className="sm:hidden">Calendar</span>
        </h3>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center flex-1 sm:min-w-[200px]">
            <span className="sm:hidden">{monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}</span>
            <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Days of week header - responsive */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid - responsive */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((day, index) => {
          const dateBackgroundColor = getDateBackgroundColor(day.bookings);
          
          return (
            <div
              key={index}
              className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 border border-gray-100 dark:border-dark-600 relative ${
                day.isCurrentMonth 
                  ? dateBackgroundColor || 'bg-white dark:bg-dark-800' 
                  : 'bg-gray-50 dark:bg-dark-700'
              } ${
                day.date.toDateString() === new Date().toDateString()
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                  : ''
              }`}
            >
              <div className={`text-xs sm:text-sm mb-1 relative z-10 ${
                day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              } ${
                day.date.toDateString() === new Date().toDateString()
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : ''
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.bookings.length > 0 && (
                <div className="space-y-0.5 sm:space-y-1 relative z-10">
                  {day.bookings.slice(0, window.innerWidth < 640 ? 2 : 3).map((booking, bookingIndex) => {
                    const isPickup = isPickupDate(day.date, booking);
                    const isDrop = isDropDate(day.date, booking);
                    const colorClass = getPickupDropColor(booking, isPickup, isDrop);
                    
                    return (
                      <div
                        key={bookingIndex}
                        className={`text-[10px] sm:text-xs px-0.5 sm:px-1 py-0.5 rounded flex items-center justify-between border ${colorClass}`}
                        title={`${booking.carName} (${booking.carType}, ${booking.carSeats} seats) - ${booking.customerName}\nPickup: ${formatDateTime(booking.pickupDate)}\nDrop: ${formatDateTime(booking.dropDate)}`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <Car className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                          <span className="truncate text-[9px] sm:text-xs">
                            <span className="sm:hidden">{booking.carName.slice(0, 4)}</span>
                            <span className="hidden sm:inline">{booking.carName}</span>
                          </span>
                        </div>
                        <div className="flex items-center ml-0.5 sm:ml-1 flex-shrink-0">
                          {isPickup && isDrop && (
                            <span className="text-[9px] sm:text-xs font-bold">P→D</span>
                          )}
                          {isPickup && !isDrop && (
                            <span className="text-[9px] sm:text-xs font-bold">P</span>
                          )}
                          {isDrop && !isPickup && (
                            <span className="text-[9px] sm:text-xs font-bold">D</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {day.bookings.length > (window.innerWidth < 640 ? 2 : 3) && (
                    <div className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                      +{day.bookings.length - (window.innerWidth < 640 ? 2 : 3)} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Responsive legend */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-600 rounded mr-2 flex-shrink-0"></div>
          <span>Electric Vehicle</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-600 rounded mr-2 flex-shrink-0"></div>
          <span>5-Seater Car</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-600 rounded mr-2 flex-shrink-0"></div>
          <span>7-Seater Car</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-100 dark:bg-purple-800 border border-purple-200 dark:border-purple-600 rounded mr-2 flex-shrink-0"></div>
          <span>Same Day P→D</span>
        </div>
      </div>

      {/* Responsive pickup/drop legend */}
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <span className="font-bold mr-1">P</span>
          <span>= Pickup Day</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold mr-1">D</span>
          <span>= Drop Day</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold mr-1">P→D</span>
          <span>= Same Day Pickup & Drop</span>
        </div>
      </div>
    </div>
  );
};