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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Contact Seller</h2>
              <p className="text-blue-100 dark:text-blue-200">Send an inquiry about this car</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-500 dark:hover:bg-blue-400 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          {/* Car Details */}
          <div className="lg:w-1/2 p-6 border-r dark:border-dark-600 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Car Details</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={car.images[0]} 
                  alt={car.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
                  <span className="font-bold">{formatPrice(car.price)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{car.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{car.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Year:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.year}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Car Driven:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.mileage.toLocaleString()} miles</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fuel:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.fuelType}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.transmission}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{car.condition}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Seller Information</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.ownerDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Preferred Contact:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{car.ownerDetails.preferredContactMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Best Time:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{car.ownerDetails.preferredContactTime}</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="space-y-2">
                <h5 className="font-semibold text-gray-900 dark:text-white">Quick Contact</h5>
                <div className="flex space-x-2">
                  <a
                    href={`tel:${car.ownerDetails.phone}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                  {car.ownerDetails.whatsapp && (
                    <a
                      href={`https://wa.me/${car.ownerDetails.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={`mailto:${car.ownerDetails.email}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send Inquiry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.buyerName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {errors.buyerName && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.buyerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerEmail: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.buyerEmail ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.buyerEmail && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.buyerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.buyerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.buyerPhone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
                {errors.buyerPhone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.buyerPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['phone', 'email', 'whatsapp'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredContactMethod: method as any }))}
                      className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                        formData.preferredContactMethod === method
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                      disabled={loading}
                    >
                      {getContactMethodIcon(method)}
                      <span className="ml-2 text-sm capitalize">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {car.negotiable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    Your Offer (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: parseInt(e.target.value) }))}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                      errors.offerPrice ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                    }`}
                    placeholder={`Asking price: ${formatPrice(car.price)}`}
                    disabled={loading}
                  />
                  {errors.offerPrice && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.offerPrice}</p>}
                  {formData.offerPrice !== car.price && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Your offer: {formatPrice(formData.offerPrice)} 
                      {formData.offerPrice < car.price && (
                        <span className="text-orange-600 dark:text-orange-400 ml-2">
                          ({formatPrice(car.price - formData.offerPrice)} below asking)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                    errors.message ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Hi, I'm interested in your car. Is it still available? I would like to know more about..."
                  disabled={loading}
                />
                {errors.message && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inspectionRequested"
                    checked={formData.inspectionRequested}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspectionRequested: e.target.checked }))}
                    className="mr-3"
                    disabled={loading}
                  />
                  <label htmlFor="inspectionRequested" className="text-sm text-gray-700 dark:text-gray-300">
                    I would like to schedule an inspection
                  </label>
                </div>

                {car.financeAvailable && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="financingNeeded"
                      checked={formData.financingNeeded}
                      onChange={(e) => setFormData(prev => ({ ...prev, financingNeeded: e.target.checked }))}
                      className="mr-3"
                      disabled={loading}
                    />
                    <label htmlFor="financingNeeded" className="text-sm text-gray-700 dark:text-gray-300">
                      I'm interested in financing options
                    </label>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Your inquiry will be sent to:</p>
                    <p>{car.ownerDetails.name}</p>
                    <p>They prefer to be contacted via {car.ownerDetails.preferredContactMethod} during {car.ownerDetails.preferredContactTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};