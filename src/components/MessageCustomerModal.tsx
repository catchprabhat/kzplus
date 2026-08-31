import React, { useState, useEffect } from 'react';
import { X, Phone, Send, MessageSquare } from 'lucide-react';
import { Booking } from '../types';

interface MessageCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const MessageCustomerModal: React.FC<MessageCustomerModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      // Auto-populate phone number from booking (digits only)
      const digits = booking.customerPhone.replace(/\D/g, '');
      setPhoneNumber(digits);

      // Draft the message with booking details
      const pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const dropDate = new Date(booking.dropDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const pickupTime = new Date(booking.pickupDate).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const dropTime = new Date(booking.dropDate).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const draftedMessage = `Dear ${booking.customerName},\n\nYour booking details:\n🚗 Vehicle: ${booking.carName}\n📅 Pickup: ${pickupDate} at ${pickupTime}\n📅 Drop: ${dropDate} at ${dropTime}\n💰 Total: ₹${booking.totalPrice}\n\nFor any queries, please contact us.\n\nThank you for choosing KZPlus!`;

      setMessage(draftedMessage);
    }
  }, [booking, isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSendWhatsApp = () => {
    if (phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsLoading(true);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=+91${phoneNumber}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    setIsLoading(false);
    setPhoneNumber('');
    setMessage('');
    onClose();
  };

  const handleClose = () => {
    setPhoneNumber('');
    setMessage('');
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Message Customer
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Booking: {booking.carName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customer: {booking.customerName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pickup: {new Date(booking.pickupDate).toLocaleDateString('en-IN')} - {new Date(booking.dropDate).toLocaleDateString('en-IN')}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer's Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">+91</span>
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit mobile number"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              maxLength={10}
            />
            <Phone className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {phoneNumber.length > 0 && phoneNumber.length < 10 && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a complete 10-digit number
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message <span className="text-gray-500 font-normal"></span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-dark-700 dark:text-white resize-y"
            placeholder="Type your message..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Message will be sent via WhatsApp
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={phoneNumber.length !== 10 || !message.trim() || isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
