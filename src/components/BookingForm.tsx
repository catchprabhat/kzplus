import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { Car, Booking } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth'; // Add this import

interface BookingFormProps {
  selectedCar: Car | null;
  pickupDate: string;
  dropDate: string;
  onBookingComplete: (booking: Booking) => void;
  loading?: boolean;
  onNavigate?: (tab: string) => void;  // Add this for navigation
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedCar,
  pickupDate,
  dropDate,
  onBookingComplete,
  loading = false,
  onNavigate  // Add this to destructuring
}) => {
  const { user, isAuthenticated } = useAuth(); // Add this hook
  
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Pre-fill form with authenticated user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [isAuthenticated, user]);

  const calculateTotalHours = () => {
    if (pickupDate && dropDate) {
      const pickup = new Date(pickupDate);
      const drop = new Date(dropDate);
      const diffTime = drop.getTime() - pickup.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);
      return diffHours > 0 ? diffHours : 0;
    }
    return 0;
  };

  const calculatePricingBreakdown = () => {
    if (!selectedCar) return { days: 0, hours: 0, totalPrice: 0, billingDays: 0 };
    
    const totalHours = calculateTotalHours();
    
    // If exactly 24 hours or multiples of 24, use day pricing only
    if (totalHours % 24 === 0) {
      const days = totalHours / 24;
      return {
        days: days,
        hours: 0,
        totalPrice: days * selectedCar.pricePerDay,
        billingDays: days
      };
    }
    
    // If less than 24 hours, use hourly pricing only
    if (totalHours < 24) {
      return {
        days: 0,
        hours: totalHours,
        totalPrice: Math.ceil(totalHours) * selectedCar.pricePerHour,
        billingDays: 0
      };
    }
    
    // Mixed pricing: days + additional hours
    const fullDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const dayPrice = fullDays * selectedCar.pricePerDay;
    const hourPrice = Math.ceil(remainingHours) * selectedCar.pricePerHour;
    
    return {
      days: fullDays,
      hours: remainingHours,
      totalPrice: dayPrice + hourPrice,
      billingDays: fullDays
    };
  };

  const calculateTotalDays = () => {
    const breakdown = calculatePricingBreakdown();
    return breakdown.billingDays;
  };

  const calculateTotalPrice = () => {
    const breakdown = calculatePricingBreakdown();
    return breakdown.totalPrice;
  };

  const formatDuration = () => {
    if (pickupDate && dropDate) {
      const pickup = new Date(pickupDate);
      const drop = new Date(dropDate);
      const diffTime = drop.getTime() - pickup.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffTime > 0) {
        let duration = '';
        if (diffDays > 0) duration += `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        if (diffHours > 0) duration += `${duration ? ', ' : ''}${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        if (diffMinutes > 0) duration += `${duration ? ', ' : ''}${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        return duration || '0 minutes';
      }
    }
    return '0 minutes';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCar || !pickupDate || !dropDate || loading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please log in to make a booking.');
      return;
    }

    // In the handleSubmit function (around line 145)
    const booking: Booking = {
      id: Date.now().toString(),
      carId: selectedCar.id,
      carName: selectedCar.name,
      carType: selectedCar.type,
      carSeats: selectedCar.seats,
      pickupDate: new Date(pickupDate),
      dropDate: new Date(dropDate),
      totalDays: calculateTotalDays(),
      totalPrice: calculateTotalPrice(),
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      status: 'pending', // Changed from 'confirmed' to 'pending'
      createdAt: new Date()
    };

    onBookingComplete(booking);
    
    // Reset form
    setCustomerData({ name: '', email: '', phone: '' });
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-4">Authentication Required</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please log in to make a booking. This ensures your bookings are saved to your account.
        </p>
        <button 
          onClick={() => onNavigate?.('profile')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const isFormValid = selectedCar && pickupDate && dropDate && customerData.name && customerData.email && customerData.phone;

  const pricingBreakdown = calculatePricingBreakdown();

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
      <p 
        className="text-center text-blue-600 hover:text-blue-800 cursor-pointer mb-4 font-medium"
        onClick={() => onNavigate?.('calendar')}
      >
        See calendar view of booked vehicles
      </p>
      <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
        Booking Details
      </h3>

      {selectedCar && pickupDate && dropDate && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-black mb-2">Booking Summary</h4>
          <div className="space-y-2 text-sm text-black-700 dark:text-black-300">
            <div className="flex justify-between">
              <span>Car:</span>
              <span className="font-medium">{selectedCar.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">{selectedCar.type} ({selectedCar.seats} seats)</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{formatDuration()}</span>
            </div>
            {pricingBreakdown.days > 0 && (
              <div className="flex justify-between">
                <span>Billing Days:</span>
                <span className="font-medium">{pricingBreakdown.days} day{pricingBreakdown.days !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Rate:</span>
              <div className="text-right">
                <div className="font-medium">₹{selectedCar.pricePerDay}/day</div>
                <div className="font-medium text-xs">₹{selectedCar.pricePerHour}/hour</div>
              </div>
            </div>
            {/* Pricing breakdown */}
            {pricingBreakdown.days > 0 && pricingBreakdown.hours > 0 && (
              <div className="text-xs text-black-500 dark:text-black-400 space-y-1">
                <div className="flex justify-between">
                  <span>{pricingBreakdown.days} day{pricingBreakdown.days !== 1 ? 's' : ''}:</span>
                  <span>₹{pricingBreakdown.days * selectedCar.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span>{Math.ceil(pricingBreakdown.hours)} hour{Math.ceil(pricingBreakdown.hours) !== 1 ? 's' : ''}:</span>
                  <span>₹{Math.ceil(pricingBreakdown.hours) * selectedCar.pricePerHour}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between border-t dark:border-dark-600 pt-2 font-bold text-blue-900 dark:text-blue-300">
              <span>Total:</span>
              <span>₹{calculateTotalPrice()}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-black-500 dark:text-black-400">
            <div>Pickup: {new Date(pickupDate).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })} at {new Date(pickupDate).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}</div>
            <div>Drop: {new Date(dropDate).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })} at {new Date(dropDate).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter your email"
            required
            disabled={loading || isAuthenticated} // Disable for authenticated users
            readOnly={isAuthenticated} // Make read-only for authenticated users
          />
          {isAuthenticated && (
            <p className="text-xs text-gray-500 mt-1">
              Using your logged-in account email
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black-700 dark:text-black-300 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={customerData.phone}
            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Enter your phone number"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center transition-all ${
            isFormValid && !loading
              ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Complete Booking
            </>
          )}
        </button>
      </form>
    </div>
  );
};