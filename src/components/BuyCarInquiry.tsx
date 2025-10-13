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
            
            <div className="space-y-6">
              {/* Fixed Image Container - Same as Featured Cars page */}
              <div className="relative h-48 overflow-hidden rounded-lg">
                <ImageCarousel 
                  images={car.images} 
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-80 text-white px-3 py-1.5 rounded-full z-20">
                  <span className="font-bold text-sm">{formatPrice(car.price)}</span>
                </div>
              </div>

              {/* Car Title and Description */}
              <div className="pt-2">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg leading-tight">{car.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{car.description}</p>
              </div>

              {/* Car Details Grid - Always visible below image */}
              <div className="bg-white dark:bg-dark-800 -mx-4 px-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Year</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{car.year}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Transmission</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{car.transmission}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Fuel</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{car.fuelType}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Condition</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base capitalize">{car.condition}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg col-span-2">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Distance Driven</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{car.mileage.toLocaleString()} km</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg col-span-2">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Location</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{car.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">Seller Information</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{car.ownerDetails.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Preferred Contact:</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{car.ownerDetails.preferredContactMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Best Time:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{car.ownerDetails.preferredContactTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};