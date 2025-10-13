import React, { useState } from 'react';
import { 
  Car, 
  Upload, 
  DollarSign, 
  FileText, 
  User, 
  MapPin, 
  Calendar,
  Settings,
  Fuel,
  Palette,
  Plus,
  X,
  Check,
  AlertCircle,
  Camera
} from 'lucide-react';
import { CarForSale } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface SellCarFormProps {
  onSubmit: (carData: Omit<CarForSale, 'id' | 'status' | 'views' | 'inquiries' | 'postedAt' | 'updatedAt' | 'expiresAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SellCarForm: React.FC<SellCarFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: '',
    location: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
    condition: 'good' as 'excellent' | 'good' | 'fair' | 'needs-work',
    ownerType: 'individual' as 'individual' | 'dealer',
    registrationState: '',
    insuranceValid: true,
    accidentHistory: false,
    serviceHistory: '',
    reasonForSelling: '',
    negotiable: true,
    exchangeAccepted: false,
    financeAvailable: false,
    ownerDetails: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      preferredContactTime: '',
      preferredContactMethod: 'phone' as 'phone' | 'email' | 'whatsapp' | 'any'
    },
    documents: {
      registration: '',
      insurance: '',
      pollution: '',
      serviceRecords: ''
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const carBrands = ['Honda', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const transmissionTypes = ['Automatic', 'Manual', 'CVT'];
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup'];
  const conditions = ['excellent', 'good', 'fair', 'needs-work'];
  const contactMethods = ['phone', 'email', 'whatsapp', 'any'];

  const commonFeatures = [
    'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging',
    'Backup Camera', 'Heated Seats', 'Sunroof', 'Leather Seats',
    'Premium Audio', 'Cruise Control', 'Keyless Entry', 'Push Start',
    'Parking Sensors', 'Lane Assist', 'Automatic Emergency Braking',
    'Alloy Wheels', 'Power Windows', 'Central Locking', 'ABS',
    'Airbags', 'Power Steering', 'Fog Lights', 'Roof Rails'
  ];

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
          newErrors.year = 'Please enter a valid year';
        }
        if (!formData.color.trim()) newErrors.color = 'Color is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;

      case 2: // Pricing & Details
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.mileage < 0) newErrors.mileage = 'Mileage cannot be negative';
        if (!formData.registrationState.trim()) newErrors.registrationState = 'Registration state is required';
        break;

      case 3: // Description & Features
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.serviceHistory.trim()) newErrors.serviceHistory = 'Service history is required';
        if (!formData.reasonForSelling.trim()) newErrors.reasonForSelling = 'Reason for selling is required';
        break;

      case 4: // Images & Documents
        if (formData.images.length === 0) newErrors.images = 'Please upload at least one image';
        if (!formData.documents.registration) newErrors.registration = 'Registration document is required';
        if (!formData.documents.insurance) newErrors.insurance = 'Insurance document is required';
        if (!formData.documents.pollution) newErrors.pollution = 'Pollution certificate is required';
        break;

      case 5: // Contact Information
        if (!formData.ownerDetails.name.trim()) newErrors.ownerName = 'Name is required';
        if (!formData.ownerDetails.email.trim()) {
          newErrors.ownerEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.ownerDetails.email)) {
          newErrors.ownerEmail = 'Email is invalid';
        }
        if (!formData.ownerDetails.phone.trim()) newErrors.ownerPhone = 'Phone number is required';
        if (!formData.ownerDetails.address.trim()) newErrors.ownerAddress = 'Address is required';
        if (!formData.ownerDetails.preferredContactTime.trim()) newErrors.preferredContactTime = 'Preferred contact time is required';
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Car className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tell us about your car</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="e.g., Crysta 2.8 G 2019 - Excellent Condition"

                  disabled={loading}
                />
                {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white ${
                    errors.brand ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Brand</option>
                  {carBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.year ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                />
                {errors.year && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Type *
                </label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, bodyType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {bodyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuel Type *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.color ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="White, Black, Silver, etc."
                  disabled={loading}
                />
                {errors.color && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="City, State"
                  disabled={loading}
                />
                {errors.location && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Set your price and provide key details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asking Price ($) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.price ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                />
                {errors.price && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mileage *
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.mileage ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Miles driven"
                  disabled={loading}
                />
                {errors.mileage && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.mileage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration State *
                </label>
                <input
                  type="text"
                  value={formData.registrationState}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationState: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.registrationState ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="NY, CA, TX, etc."
                  disabled={loading}
                />
                {errors.registrationState && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.registrationState}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner Type
                </label>
                <select
                  value={formData.ownerType}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerType: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  <option value="individual">Individual</option>
                  <option value="dealer">Dealer</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="insuranceValid"
                  checked={formData.insuranceValid}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceValid: e.target.checked }))}
                  className="mr-3"
                  disabled={loading}
                />
                <label htmlFor="insuranceValid" className="text-sm text-gray-700 dark:text-gray-300">
                  Insurance is valid and up to date
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="accidentHistory"
                  checked={formData.accidentHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, accidentHistory: e.target.checked }))}
                  className="mr-3"
                  disabled={loading}
                />
                <label htmlFor="accidentHistory" className="text-sm text-gray-700 dark:text-gray-300">
                  Car has been in an accident
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={formData.negotiable}
                  onChange={(e) => setFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                  className="mr-3"
                  disabled={loading}
                />
                <label htmlFor="negotiable" className="text-sm text-gray-700 dark:text-gray-300">
                  Price is negotiable
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="exchangeAccepted"
                  checked={formData.exchangeAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, exchangeAccepted: e.target.checked }))}
                  className="mr-3"
                  disabled={loading}
                />
                <label htmlFor="exchangeAccepted" className="text-sm text-gray-700 dark:text-gray-300">
                  Exchange accepted
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="financeAvailable"
                  checked={formData.financeAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, financeAvailable: e.target.checked }))}
                  className="mr-3"
                  disabled={loading}
                />
                <label htmlFor="financeAvailable" className="text-sm text-gray-700 dark:text-gray-300">
                  Financing available
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description & Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Describe your car and add features</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                  errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                }`}
                placeholder="Describe your car's condition, maintenance history, and any special features..."
                disabled={loading}
              />
              {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service History *
              </label>
              <textarea
                value={formData.serviceHistory}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceHistory: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                  errors.serviceHistory ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                }`}
                placeholder="Describe maintenance history, recent services, and any repairs..."
                disabled={loading}
              />
              {errors.serviceHistory && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.serviceHistory}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Selling *
              </label>
              <input
                type="text"
                value={formData.reasonForSelling}
                onChange={(e) => setFormData(prev => ({ ...prev, reasonForSelling: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                  errors.reasonForSelling ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                }`}
                placeholder="Upgrading, moving, no longer needed, etc."
                disabled={loading}
              />
              {errors.reasonForSelling && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.reasonForSelling}</p>}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              
              {/* Add Custom Feature */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white"
                  placeholder="Add custom feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center"
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
                        className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Images & Documents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload photos and required documents</p>
            </div>

            {/* Car Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Car Images * (Upload at least 1 image)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Upload multiple high-quality images</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Include exterior, interior, engine, and any damage photos
                </p>
              </div>
              {errors.images && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Records (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload Service History</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">How buyers can reach you</p>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.ownerPhone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
                {errors.ownerPhone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.ownerDetails.whatsapp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, whatsapp: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white"
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white resize-none ${
                    errors.ownerAddress ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your complete address"
                  disabled={loading}
                />
                {errors.ownerAddress && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ownerAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Time *
                </label>
                <input
                  type="text"
                  value={formData.ownerDetails.preferredContactTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, preferredContactTime: e.target.value }
                  }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-white ${
                    errors.preferredContactTime ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="e.g., Weekdays 9 AM - 6 PM"
                  disabled={loading}
                />
                {errors.preferredContactTime && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.preferredContactTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Method
                </label>
                <select
                  value={formData.ownerDetails.preferredContactMethod}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ownerDetails: { ...prev.ownerDetails, preferredContactMethod: e.target.value as any }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all bg-white dark:bg-dark-700 dark:text-white"
                  disabled={loading}
                >
                  {contactMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sell Your Car</h2>
              <p className="text-purple-100 dark:text-purple-200">Create a listing to connect with buyers</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-purple-500 dark:hover:bg-purple-400 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-purple-100 dark:text-purple-200 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-purple-500 dark:bg-purple-400 rounded-full h-2">
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
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-all flex items-center"
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
                      Create Listing
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