import React, { useState } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  User, 
  IndianRupee, 
  Calendar,
  Eye,
  FileText,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { CarForSale, SaleInquiry } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageCarousel } from './ImageCarousel';

interface BuyCarInquiryProps {
  car: CarForSale;
  onSubmit: (inquiryData: Omit<SaleInquiry, 'id' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BuyCarInquiry: React.FC<BuyCarInquiryProps> = ({
  car,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    message: '',
    offerPrice: car.price,
    financingNeeded: false,
    inspectionRequested: true,
    preferredContactMethod: 'phone' as 'phone' | 'email' | 'whatsapp'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Name is required';
    }

    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Email is invalid';
    }

    if (!formData.buyerPhone.trim()) {
      newErrors.buyerPhone = 'Phone number is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (formData.offerPrice <= 0) {
      newErrors.offerPrice = 'Offer price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const inquiryData: Omit<SaleInquiry, 'id' | 'status' | 'createdAt'> = {
      carId: car.id,
      carTitle: car.title,
      buyerName: formData.buyerName,
      buyerEmail: formData.buyerEmail,
      buyerPhone: formData.buyerPhone,
      message: formData.message,
      offerPrice: formData.offerPrice !== car.price ? formData.offerPrice : undefined,
      financingNeeded: formData.financingNeeded,
      inspectionRequested: formData.inspectionRequested,
      preferredContactMethod: formData.preferredContactMethod
    };

    onSubmit(inquiryData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Contact Seller</h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base">Send an inquiry about this car</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-500 dark:hover:bg-blue-400 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
          {/* Car Details */}
          <div className="w-full p-4 sm:p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Car Details</h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <ImageCarousel 
                  images={car.images} 
                  alt={car.title}
                  className="w-full h-48 sm:h-56 md:h-64 rounded-lg"
                />
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded-full z-10">
                  <span className="font-bold text-sm sm:text-base">{formatPrice(car.price)}</span>
                </div>
              </div>

              <div className="pt-4 sm:pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-base sm:text-lg">{car.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{car.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Year:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.year}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Car Driven:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Fuel:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.fuelType}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Transmission:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.transmission}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Location:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.location}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Condition:</span>
                  <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white capitalize">{car.condition}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 sm:p-4 mt-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Seller Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Name:</span>
                    <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.ownerDetails.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Preferred Contact:</span>
                    <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white capitalize">{car.ownerDetails.preferredContactMethod}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Best Time:</span>
                    <span className="sm:ml-2 font-semibold text-gray-900 dark:text-white">{car.ownerDetails.preferredContactTime}</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="space-y-3 mt-4">
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Quick Contact</h5>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <a
                    href="tel:7735537655"
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                  <a
                    href="https://wa.me/7735537655"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};