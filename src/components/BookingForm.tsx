import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { Car, Booking } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface BookingFormProps {
  selectedCar: Car | null;
  pickupDate: string;
  dropDate: string;
  onBookingComplete: (booking: Booking) => void;
  loading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedCar,
  pickupDate,
  dropDate,
  onBookingComplete,
  loading = false
}) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });

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

  const calculateTotalDays = () => {
    const hours = calculateTotalHours();
    return Math.ceil(hours / 24); // Round up to next day for pricing
  };

  const calculateTotalPrice = () => {
    if (selectedCar) {
      const days = calculateTotalDays();
      return days * selectedCar.pricePerDay;
    }
    return 0;
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
      status: 'confirmed',
      createdAt: new Date()
    };

    onBookingComplete(booking);
    
    // Reset form
    setCustomerData({ name: '', email: '', phone: '' });
  };

  const isFormValid = selectedCar && pickupDate && dropDate && customerData.name && customerData.email && customerData.phone;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        Booking Details
      </h3>

      {selectedCar && pickupDate && dropDate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
          <div className="space-y-2 text-sm text-gray-700">
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
            <div className="flex justify-between">
              <span>Billing Days:</span>
              <span className="font-medium">{calculateTotalDays()} day{calculateTotalDays() !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="font-medium">${selectedCar.pricePerDay}/day</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-blue-900">
              <span>Total:</span>
              <span>${calculateTotalPrice()}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={customerData.phone}
            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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