import React, { useState } from 'react';
import { User, Mail, Phone, Car, Calendar, MapPin, FileText, Save, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface CustomerDetailsFormProps {
  onSubmit: (customerData: CustomerFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface CustomerFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Vehicle Information
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleType: 'Sedan' | 'SUV' | 'Hatchback' | 'Sports' | 'Electric' | 'Other';
  
  // Service Information
  preferredDate: string;
  preferredTime: string;
  serviceLocation: 'pickup' | 'drop-off' | 'workshop';
  pickupAddress?: string;
  
  // Additional Information
  previousService: boolean;
  lastServiceDate?: string;
  serviceHistory?: string;
  specialRequests?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Preferences
  communicationPreference: 'email' | 'phone' | 'whatsapp' | 'all';
  marketingConsent: boolean;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleType: 'Sedan',
    preferredDate: '',
    preferredTime: '09:00',
    serviceLocation: 'workshop',
    pickupAddress: '',
    previousService: false,
    lastServiceDate: '',
    serviceHistory: '',
    specialRequests: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    communicationPreference: 'all',
    marketingConsent: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
          newErrors.phone = 'Phone number is invalid';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) {
          newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode)) {
          newErrors.pincode = 'Pincode must be 6 digits';
        }
        break;

      case 2: // Vehicle Information
        if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
        if (!formData.vehicleMake.trim()) newErrors.vehicleMake = 'Vehicle make is required';
        if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
        if (!formData.vehicleYear.trim()) {
          newErrors.vehicleYear = 'Vehicle year is required';
        } else if (!/^\d{4}$/.test(formData.vehicleYear)) {
          newErrors.vehicleYear = 'Vehicle year must be 4 digits';
        } else {
          const year = parseInt(formData.vehicleYear);
          const currentYear = new Date().getFullYear();
          if (year < 1990 || year > currentYear + 1) {
            newErrors.vehicleYear = `Year must be between 1990 and ${currentYear + 1}`;
          }
        }
        if (!formData.vehicleColor.trim()) newErrors.vehicleColor = 'Vehicle color is required';
        break;

      case 3: // Service Information
        if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required';
        if (formData.serviceLocation === 'pickup' && !formData.pickupAddress?.trim()) {
          newErrors.pickupAddress = 'Pickup address is required';
        }
        if (formData.previousService && formData.lastServiceDate && formData.lastServiceDate > formData.preferredDate) {
          newErrors.lastServiceDate = 'Last service date cannot be in the future';
        }
        break;

      case 4: // Additional Information (optional fields, minimal validation)
        if (formData.emergencyContactName && !formData.emergencyContactPhone) {
          newErrors.emergencyContactPhone = 'Emergency contact phone is required when name is provided';
        }
        if (formData.emergencyContactPhone && !formData.emergencyContactName) {
          newErrors.emergencyContactName = 'Emergency contact name is required when phone is provided';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Sports', 'Electric', 'Other'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return { value: time, display: displayTime };
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">Tell us about yourself and your address</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete address"
                  disabled={loading}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                  disabled={loading}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your state"
                  disabled={loading}
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.pincode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123456"
                  maxLength={6}
                  disabled={loading}
                />
                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
              <p className="text-sm text-gray-600">Tell us about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="MH01AB1234"
                  disabled={loading}
                />
                {errors.vehicleNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Make *
                </label>
                <input
                  type="text"
                  value={formData.vehicleMake}
                  onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.vehicleMake ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Honda, Toyota, BMW, etc."
                  disabled={loading}
                />
                {errors.vehicleMake && <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.vehicleModel ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Civic, Camry, X5, etc."
                  disabled={loading}
                />
                {errors.vehicleModel && <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Year *
                </label>
                <input
                  type="text"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.vehicleYear ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="2022"
                  maxLength={4}
                  disabled={loading}
                />
                {errors.vehicleYear && <p className="text-red-500 text-sm mt-1">{errors.vehicleYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  disabled={loading}
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Color *
                </label>
                <input
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.vehicleColor ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="White, Black, Silver, etc."
                  disabled={loading}
                />
                {errors.vehicleColor && <p className="text-red-500 text-sm mt-1">{errors.vehicleColor}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
              <p className="text-sm text-gray-600">When and where would you like the service?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  min={today}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.preferredDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.preferredDate && <p className="text-red-500 text-sm mt-1">{errors.preferredDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  disabled={loading}
                >
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.display}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Location
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="workshop"
                      checked={formData.serviceLocation === 'workshop'}
                      onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span>Bring to workshop</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pickup"
                      checked={formData.serviceLocation === 'pickup'}
                      onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span>Pickup from my location</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="drop-off"
                      checked={formData.serviceLocation === 'drop-off'}
                      onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span>Drop-off at my location</span>
                  </label>
                </div>
              </div>

              {formData.serviceLocation === 'pickup' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Address *
                  </label>
                  <textarea
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.pickupAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter pickup address if different from your address"
                    disabled={loading}
                  />
                  {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.previousService}
                    onChange={(e) => handleInputChange('previousService', e.target.checked)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span>I have serviced this vehicle before</span>
                </label>
              </div>

              {formData.previousService && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Service Date
                    </label>
                    <input
                      type="date"
                      value={formData.lastServiceDate}
                      onChange={(e) => handleInputChange('lastServiceDate', e.target.value)}
                      max={today}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.lastServiceDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                    {errors.lastServiceDate && <p className="text-red-500 text-sm mt-1">{errors.lastServiceDate}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service History
                    </label>
                    <textarea
                      value={formData.serviceHistory}
                      onChange={(e) => handleInputChange('serviceHistory', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Describe previous services, issues, or maintenance history"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Issues
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Any specific issues, requests, or things we should know about your vehicle"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              <p className="text-sm text-gray-600">Optional details and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.emergencyContactName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Emergency contact person"
                  disabled={loading}
                />
                {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
                {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Preference
                </label>
                <select
                  value={formData.communicationPreference}
                  onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  disabled={loading}
                >
                  <option value="all">All (Email, Phone, WhatsApp)</option>
                  <option value="email">Email only</option>
                  <option value="phone">Phone only</option>
                  <option value="whatsapp">WhatsApp only</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm">
                    I agree to receive promotional offers and service reminders via email and SMS
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customer Registration</h2>
              <p className="text-blue-100">Complete your profile to book car services</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-blue-100 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};