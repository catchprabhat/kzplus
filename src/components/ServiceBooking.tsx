import React, { useState, useEffect } from 'react';
import { Search, Car, Phone, Calendar, Clock, User, Mail, Plus, Minus, Wrench, UserPlus } from 'lucide-react';
import { Service, Vehicle, ServiceBooking as ServiceBookingType } from '../types';
import { services } from '../data/services';
import { LoadingSpinner } from './LoadingSpinner';
import { CustomerDetailsForm, CustomerFormData } from './CustomerDetailsForm';

interface ServiceBookingProps {
  onServiceBookingComplete: (booking: ServiceBookingType) => void;
  loading?: boolean;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  onServiceBookingComplete,
  loading = false
}) => {
  // Add useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vehicle' | 'phone'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormLoading, setCustomerFormLoading] = useState(false);

  // Mock vehicle search - replace with actual API call
  const searchVehicle = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchAttempted(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock vehicle data - replace with actual API call
      const mockVehicle: Vehicle = {
        id: '1',
        vehicleNumber: searchQuery.toUpperCase(),
        name: 'Honda Civic',
        type: 'Sedan',
        model: 'Civic LX',
        year: 2022,
        color: 'Silver',
        ownerName: 'John Doe',
        ownerPhone: '+1-555-0123',
        ownerEmail: 'john@example.com',
        lastServiceDate: new Date(2024, 10, 15),
        createdAt: new Date()
      };
      
      // Simulate search by phone number
      if (searchType === 'phone') {
        if (searchQuery === '5550123' || searchQuery === '+1-555-0123') {
          setSelectedVehicle(mockVehicle);
          setCustomerData({
            name: mockVehicle.ownerName,
            email: mockVehicle.ownerEmail,
            phone: mockVehicle.ownerPhone,
            notes: ''
          });
        } else {
          // Customer not found - show new customer message
          setSearchError('Customer not found.');
        }
      } else {
        // Search by vehicle number
        if (searchQuery.toLowerCase().includes('abc') || searchQuery.toLowerCase().includes('123')) {
          setSelectedVehicle(mockVehicle);
          setCustomerData({
            name: mockVehicle.ownerName,
            email: mockVehicle.ownerEmail,
            phone: mockVehicle.ownerPhone,
            notes: ''
          });
        } else {
          // Vehicle not found - show new customer message without error
          setSelectedVehicle(null);
        }
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerRegistration = async (formData: CustomerFormData) => {
    try {
      setCustomerFormLoading(true);
      
      // Simulate API call to register customer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create vehicle object from form data
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        vehicleNumber: formData.vehicleNumber,
        name: `${formData.vehicleMake} ${formData.vehicleModel}`,
        type: formData.vehicleType,
        model: formData.vehicleModel,
        year: parseInt(formData.vehicleYear),
        color: formData.vehicleColor,
        ownerName: formData.name,
        ownerPhone: formData.phone,
        ownerEmail: formData.email,
        lastServiceDate: formData.lastServiceDate ? new Date(formData.lastServiceDate) : undefined,
        createdAt: new Date()
      };
      
      // Set the vehicle and customer data
      setSelectedVehicle(newVehicle);
      setCustomerData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.specialRequests || ''
      });
      
      // Set service preferences from form
      if (formData.preferredDate) {
        setScheduledDate(formData.preferredDate);
      }
      setScheduledTime(formData.preferredTime);
      
      // Close the form
      setShowCustomerForm(false);
      setSearchError(null);
      setSearchAttempted(false);
      
      // Clear search query and update it with the new vehicle number
      setSearchQuery(formData.vehicleNumber);
      
      // Scroll to service selection
      setTimeout(() => {
        document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('Failed to register customer:', error);
    } finally {
      setCustomerFormLoading(false);
    }
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const getServiceIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      droplets: <div className="w-5 h-5 bg-blue-500 rounded-full"></div>,
      sparkles: <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>,
      shield: <div className="w-5 h-5 bg-green-500 rounded-full"></div>,
      star: <div className="w-5 h-5 bg-purple-500 rounded-full"></div>,
      wind: <div className="w-5 h-5 bg-cyan-500 rounded-full"></div>,
      home: <div className="w-5 h-5 bg-orange-500 rounded-full"></div>,
      droplet: <div className="w-5 h-5 bg-blue-600 rounded-full"></div>,
      disc: <div className="w-5 h-5 bg-red-500 rounded-full"></div>,
      circle: <div className="w-5 h-5 bg-gray-500 rounded-full"></div>,
      search: <div className="w-5 h-5 bg-indigo-500 rounded-full"></div>,
      battery: <div className="w-5 h-5 bg-green-600 rounded-full"></div>,
      wrench: <div className="w-5 h-5 bg-amber-500 rounded-full"></div>
    };
    return iconMap[iconName] || <Wrench className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleaning': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'maintenance': return 'bg-green-50 border-green-200 text-green-800';
      case 'repair': return 'bg-red-50 border-red-200 text-red-800';
      case 'enhancement': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || selectedServices.length === 0 || !scheduledDate || loading) return;

    const serviceBooking: ServiceBookingType = {
      id: Date.now().toString(),
      vehicleNumber: selectedVehicle.vehicleNumber,
      vehicleName: selectedVehicle.name,
      vehicleType: selectedVehicle.type,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      customerEmail: customerData.email,
      services: selectedServices,
      totalPrice: calculateTotal(),
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      status: 'pending',
      notes: customerData.notes,
      createdAt: new Date()
    };

    onServiceBookingComplete(serviceBooking);
    
    // Reset form
    setSelectedVehicle(null);
    setSelectedServices([]);
    setScheduledDate('');
    setScheduledTime('09:00');
    setCustomerData({ name: '', email: '', phone: '', notes: '' });
    setSearchQuery('');
    setSearchAttempted(false);
  };

  const handleRepeatService = () => {
    // Auto-select the last service if available
    if (selectedVehicle?.lastServiceDate) {
      const previousService = services.find(s => s.id === 'wash-premium'); // Mock: replace with actual last service
      if (previousService && !selectedServices.find(s => s.id === previousService.id)) {
        setSelectedServices([previousService]);
      }
    }
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleSelectService = () => {
    // Scroll to service selection
    setTimeout(() => {
      document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const today = new Date().toISOString().split('T')[0];
  const isFormValid = selectedVehicle && selectedServices.length > 0 && scheduledDate && customerData.name && customerData.phone;

  return (
    <div className="space-y-8">
      {/* Customer Registration Form Modal */}
      {showCustomerForm && (
        <CustomerDetailsForm
          onSubmit={handleCustomerRegistration}
          onCancel={() => setShowCustomerForm(false)}
          loading={customerFormLoading}
        />
      )}

      {/* Hero Section with Vehicle Search */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Book Car Services
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Professional car maintenance and detailing services at your convenience
        </p>
        
        {/* Find Your Vehicle Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Find Your Vehicle
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchType('vehicle')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  searchType === 'vehicle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Car className="w-4 h-4 inline mr-2" />
                Vehicle Number
              </button>
              <button
                onClick={() => setSearchType('phone')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  searchType === 'phone'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </button>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchAttempted(false); // Reset searchAttempted when typing
                }}
                placeholder={searchType === 'vehicle' ? 'Enter vehicle number (e.g., ABC123)' : 'Enter phone number (e.g., 5550123)'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={searchLoading}
              />
              <button
                onClick={searchVehicle}
                disabled={!searchQuery.trim() || searchLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {searchLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* New Customer Button - Only show if no vehicle is selected and no search has been attempted */}
            {!selectedVehicle && !searchAttempted && (
              <div className="text-center">
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Customer? Register Here
                </button>
              </div>
            )}

            {/* New Customer Message - Show only after search attempt */}
            {searchAttempted && (searchError || !selectedVehicle) && !searchLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">New Customer?</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Don't worry! We'll help you register quickly and get your vehicle serviced.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowCustomerForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Now
                  </button>
                </div>
              </div>
            )}

            {selectedVehicle && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Vehicle Found!</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                  <div><strong>Vehicle:</strong> {selectedVehicle.name}</div>
                  <div><strong>Number:</strong> {selectedVehicle.vehicleNumber}</div>
                  <div><strong>Type:</strong> {selectedVehicle.type}</div>
                  <div><strong>Year:</strong> {selectedVehicle.year}</div>
                  <div><strong>Owner:</strong> {selectedVehicle.ownerName}</div>
                  <div><strong>Phone:</strong> {selectedVehicle.ownerPhone}</div>
                </div>
                {selectedVehicle.lastServiceDate && (
                  <div className="mt-2 text-sm text-green-700">
                    <strong>Last Service:</strong> {selectedVehicle.lastServiceDate.toLocaleDateString()}
                  </div>
                )}
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={handleRepeatService}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Repeat Service
                  </button>
                  <button
                    onClick={handleSelectService}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Select Service
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Selection and Booking Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Service Selection */}
        <div id="service-selection" className="bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-blue-600" />
            Select Services
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {services.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceToggle(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getServiceIcon(service.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(service.category)}`}>
                            {service.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </span>
                          <span className="font-semibold text-blue-600">${service.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isSelected ? (
                        <Minus className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Services ({selectedServices.length})</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>${service.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-blue-200 mt-2 pt-2 font-bold text-blue-900">
                Total: ${calculateTotal()}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div id="booking-form" className="bg-white rounded-xl shadow-lg p-6 lg:ml-auto lg:max-w-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Schedule Service
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Service Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Preferred Time
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 9 + i;
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    return (
                      <option key={time} value={time}>
                        {displayTime}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific requirements or notes..."
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
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Service - ${calculateTotal()}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};