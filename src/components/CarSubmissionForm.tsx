import React, { useState } from 'react';
import { Car, Upload, User, FileText, DollarSign, Settings, Plus, X, Check, AlertCircle } from 'lucide-react';
import { CarSubmission } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageUpload } from './ImageUpload';

interface CarSubmissionFormProps {
  onSubmit: (submission: CarSubmission) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CarSubmissionForm: React.FC<CarSubmissionFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<Omit<CarSubmission, 'id' | 'status' | 'submittedAt'>>({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 50,
    features: [],
    description: '',
    images: [],
    documents: {
      registration: '',
      insurance: '',
      pollution: ''
    },
    ownerDetails: {
      name: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: ''
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const carTypes = ['Sedan', 'SUV', 'Hatchback', 'Sports', 'Electric', 'Luxury', 'Convertible'];
  const transmissionTypes = ['Automatic', 'Manual', 'CVT'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const seatOptions = [2, 4, 5, 7, 8];

  const commonFeatures = [
    'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging',
    'Backup Camera', 'Heated Seats', 'Sunroof', 'Leather Seats',
    'Premium Audio', 'Cruise Control', 'Keyless Entry', 'Push Start',
    'Parking Sensors', 'Lane Assist', 'Automatic Emergency Braking'
  ];

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.name.trim()) newErrors.name = 'Car name is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
          newErrors.year = 'Please enter a valid year';
        }
        if (formData.pricePerDay < 10) newErrors.pricePerDay = 'Price must be at least $10/day';
        break;

      case 2: // Features & Description
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.features.length === 0) newErrors.features = 'Please add at least one feature';
        break;

      case 3: // Images & Documents
        if (formData.images.length === 0) newErrors.images = 'Please upload at least one image';
        if (!formData.documents.registration) newErrors.registration = 'Registration document is required';
        if (!formData.documents.insurance) newErrors.insurance = 'Insurance document is required';
        if (!formData.documents.pollution) newErrors.pollution = 'Pollution certificate is required';
        break;

      case 4: // Owner Details
        if (!formData.ownerDetails.name.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerDetails.email.trim()) {
          newErrors.ownerEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.ownerDetails.email)) {
          newErrors.ownerEmail = 'Email is invalid';
        }
        if (!formData.ownerDetails.phone.trim()) newErrors.ownerPhone = 'Phone number is required';
        if (!formData.ownerDetails.address.trim()) newErrors.ownerAddress = 'Address is required';
        if (!formData.ownerDetails.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
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
      const submission: CarSubmission = {
        ...formData,
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date()
      };
      onSubmit(submission);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addCommonFeature = (feature: string) => {
    if (!formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleImageUpload = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Car className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tell us about your car</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Car Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="e.g., Honda Civic LX 2023"
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.brand ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Honda, Toyota, BMW, etc."
                  disabled={loading}
                />
                {errors.brand && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.model ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Civic, Camry, X5, etc."
                  disabled={loading}
                />
                {errors.model && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.year ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                />
                {errors.year && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {carTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seats *
                </label>
                <select
                  value={formData.seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {seatOptions.map(seats => (
                    <option key={seats} value={seats}>{seats} Seats</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transmission *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuel Type *
                </label>
                <select
                  value={formData.fuel}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price per Day ($) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: parseInt(e.target.value) }))}
                  min="10"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.pricePerDay ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                />
                {errors.pricePerDay && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pricePerDay}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Features & Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Add features and describe your car</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                  errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                }`}
                placeholder="Describe your car's condition, special features, and any important details..."
                disabled={loading}
              />
              {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features *
              </label>
              
              {/* Add Custom Feature */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white"
                  placeholder="Add custom feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Common Features */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick add common features:</p>
                <div className="flex flex-wrap gap-2">
                  {commonFeatures.map(feature => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => addCommonFeature(feature)}
                      disabled={formData.features.includes(feature) || loading}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.features.includes(feature)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                      }`}
                    >
                      {formData.features.includes(feature) && <Check className="w-3 h-3 inline mr-1" />}
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Features */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Features:</p>
                {formData.features.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No features added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map(feature => (
                      <span
                        key={feature}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {errors.features && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.features}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Images & Documents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload car images and required documents</p>
            </div>

            {/* Car Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Car Images * (Upload at least 1 image)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Upload multiple images of your car</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Include exterior, interior, and engine photos
                </p>
              </div>
              {errors.images && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration Certificate *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload RC</p>
                </div>
                {errors.registration && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.registration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Certificate *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload Insurance</p>
                </div>
                {errors.insurance && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.insurance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pollution Certificate *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload PUC</p>
                </div>
                {errors.pollution && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pollution}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Owner Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Provide your contact information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerDetails.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, name: e.target.value }
                  }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.ownerName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {errors.ownerName && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.ownerDetails.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, email: e.target.value }
                  }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.ownerEmail ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.ownerEmail && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.ownerDetails.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, phone: e.target.value }
                  }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.ownerPhone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
                {errors.ownerPhone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driving License Number *
                </label>
                <input
                  type="text"
                  value={formData.ownerDetails.licenseNumber}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, licenseNumber: e.target.value }
                  }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.licenseNumber ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="DL1234567890"
                  disabled={loading}
                />
                {errors.licenseNumber && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.ownerDetails.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, address: e.target.value }
                  }))}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                    errors.ownerAddress ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your complete address"
                  disabled={loading}
                />
                {errors.ownerAddress && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerAddress}</p>}
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
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Submit Your Car</h2>
              <p className="text-blue-100 dark:text-blue-200">List your car for self-drive rental</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-500 dark:hover:bg-blue-400 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-blue-100 dark:text-blue-200 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-500 dark:bg-blue-400 rounded-full h-2">
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
        <div className="border-t dark:border-dark-600 bg-gray-50 dark:bg-dark-700 p-6">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-all"
              >
                Cancel
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all flex items-center"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-all flex items-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Submit for Review
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