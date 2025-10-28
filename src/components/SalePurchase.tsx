import React, { useState } from 'react';
import { 
  Car, 
  IndianRupee, 
  Search, 
  Plus, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Calendar,
  Eye,
  Heart,
  Filter,
  SortAsc,
  ArrowRight,
  Shield,
  CheckCircle,
  Star,
  Fuel,
  Settings,
  Users,
  Clock
} from 'lucide-react';
import { CarForSale, SaleInquiry } from '../types';
import { SellCarForm } from './SellCarForm';
import { BuyCarInquiry } from './BuyCarInquiry';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageCarousel } from './ImageCarousel';

export const SalePurchase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buy' | 'sell'>('overview');
  const [showSellForm, setShowSellForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarForSale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filters, setFilters] = useState({
    brand: 'all',
    fuelType: 'all',
    transmission: 'all',
    bodyType: 'all',
    condition: 'all',
    ownerType: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);

  // Mock data for cars for sale - Updated to keep only first car with new images
  const carsForSale: CarForSale[] = [
    {
      id: '1',
      title: 'Crysta 2.8 G 2019 - Excellent Condition',
      brand: 'Toyota',
      model: 'Crysta',
      year: 2019,
      price: 1590000,
      mileage: 140000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      color: 'Silver',
      location: 'Bangalore, KA',

      description: 'Well-maintained Crysta with full service history. Single owner, garage kept. All maintenance done at authorized service center.',
      features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Heated Seats', 'Cruise Control'],
      images: [
        '/images/car1.jpg',
        '/images/car2.jpg',
        '/images/car3.jpg',
        '/images/car4.jpg',
        '/images/innova-inner.jpg',
        '/images/innova-inner1.jpg',
        '/images/innova-inner2.jpg'
      ],
      condition: 'excellent',
      ownerType: 'individual',
      registrationState: 'KA',
      insuranceValid: true,
      accidentHistory: false,
      serviceHistory: 'Complete service history available',
      reasonForSelling: 'Upgrading to a larger vehicle',
      negotiable: true,
      exchangeAccepted: false,
      financeAvailable: true,
      ownerDetails: {
        name: 'Prasanth Kumar',
        email: 'pkumargr26@gmail.com',
        phone: '+1-9972099669',
        whatsapp: '+1-9972099669',
        address: 'Bangalore, KA',
        preferredContactTime: 'Evenings (6-9 PM)',
        preferredContactMethod: 'phone',
        registration:'HR-21-xxxx'
      },
      documents: {
        registration: 'rc_honda_civic.pdf',
        insurance: 'insurance_honda_civic.pdf',
        pollution: 'puc_honda_civic.pdf',
        serviceRecords: 'service_honda_civic.pdf'
      },
      status: 'active',
      views: 245,
      inquiries: 12,
      postedAt: new Date(2025, 0, 10),
      updatedAt: new Date(2025, 0, 15),
      expiresAt: new Date(2025, 2, 10)
    },
    {
      id: '2',
      title: 'Crysta 2.8 G 2016 - Excellent Condition',
      brand: 'Toyota',
      model: 'Crysta',
      year: 2016,
      price: 1590000,
      mileage: 135000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      color: 'Silver',
      location: 'Bangalore, KA',

      description: 'Well-maintained Crysta with full service history. Single owner, garage kept. All maintenance done at authorized service center.',
      features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Heated Seats', 'Cruise Control'],
      images: [
        '/images/crista_silver/Crista_silver07.jpg',
        '/images/crista_silver/Crista_silver02.jpg',
        '/images/crista_silver/Crista_silver03.jpg',
        '/images/crista_silver/Crista_silver04.jpg',
        '/images/crista_silver/Crista_silver05.jpg',
        '/images/crista_silver/Crista_silver06.jpg',
        '/images/crista_silver/Crista_silver01.jpg',
        '/images/crista_silver/Crista_silver08.jpg',
        '/images/crista_silver/Crista_silver09.jpg',
        '/images/crista_silver/Crista_silver10.jpg',
        '/images/crista_silver/Crista_silver11.jpg',
        '/images/crista_silver/Crista_silver12.jpg',
        '/images/crista_silver/Crista_silver13.jpg',
        
      ],
      condition: 'excellent',
      ownerType: 'individual',
      registrationState: 'KA',
      insuranceValid: true,
      accidentHistory: false,
      serviceHistory: 'Complete service history available',
      reasonForSelling: 'Upgrading to a larger vehicle',
      negotiable: true,
      exchangeAccepted: false,
      financeAvailable: true,
      ownerDetails: {
        name: 'Prasanth Kumar',
        email: 'pkumargr26@gmail.com',
        phone: '+1-9972099669',
        whatsapp: '+1-9972099669',
        address: 'Bangalore, KA',
        preferredContactTime: 'Evenings (6-9 PM)',
        preferredContactMethod: 'phone',
        registration:'HR-21-xxxx'
      },
      documents: {
        registration: 'rc_honda_civic.pdf',
        insurance: 'insurance_honda_civic.pdf',
        pollution: 'puc_honda_civic.pdf',
        serviceRecords: 'service_honda_civic.pdf'
      },
      status: 'active',
      views: 245,
      inquiries: 12,
      postedAt: new Date(2025, 0, 10),
      updatedAt: new Date(2025, 0, 15),
      expiresAt: new Date(2025, 2, 10)
    }
  ];

  const handleSellCar = async (carData: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Car listing submitted:', carData);
      alert('🚗 Car listed successfully! Your listing is now live and buyers can contact you.');
      setShowSellForm(false);
    } catch (error) {
      console.error('Failed to list car:', error);
      alert('Failed to list car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyInquiry = async (inquiryData: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Buy inquiry submitted:', inquiryData);
      alert('📞 Inquiry sent successfully! The seller will contact you soon via your preferred method.');
      setShowInquiryForm(false);
      setSelectedCar(null);
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCars = () => {
    let filtered = carsForSale;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(car =>
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(car => car.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(car => car.price <= parseInt(priceRange.max));
    }

    // Other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        filtered = filtered.filter(car => car[key as keyof CarForSale] === value);
      }
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'mileage':
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return filtered;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'good':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'fair':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'needs-work':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredCars = getFilteredCars();

  const OverviewSection = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Buy & Sell Cars
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 block sm:inline"> Marketplace</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your trusted platform for buying and selling cars with verified listings, 
            fair pricing, and complete documentation assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('buy')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Search className="w-6 h-6 mr-2" />
              Browse Cars
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Plus className="w-6 h-6 mr-2" />
              Sell Your Car
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cars Available</div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Verified Listings</div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
        </div>
        
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Secure Transactions</div>
        </div>
      </div>

      {/* Featured Cars */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Cars</h2>
          <button
            onClick={() => setActiveTab('buy')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carsForSale.slice(0, 3).map(car => (
            <div key={car.id} className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <ImageCarousel 
                  images={car.images} 
                  alt={car.title}
                  className="w-full h-48"
                />
                <div className="absolute top-4 right-4 bg-white dark:bg-dark-700 bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getConditionColor(car.condition)}`}>
                    {car.condition}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">{formatPrice(car.price)}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{car.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {car.year}
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    {car.transmission}
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1" />
                    {car.fuelType}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {car.location}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatMileage(car.mileage)} km
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      setActiveTab('buy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 dark:bg-dark-800 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Buying Process */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Search className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              Buying a Car
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Browse & Filter</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Search through verified listings with detailed filters</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Contact Seller</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Connect via phone, WhatsApp, or email</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Inspect & Buy</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Schedule inspection and complete the purchase</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selling Process */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
              Selling a Car
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Create Listing</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Add photos, details, and set your price</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Get Inquiries</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Receive calls and messages from interested buyers</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Close Deal</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Negotiate and complete the sale securely</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BuySection = () => (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, model, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 dark:text-white text-sm"
              >
                <option value="all">All Brands</option>
                <option value="Honda">Honda</option>
                <option value="BMW">BMW</option>
                <option value="Tesla">Tesla</option>
                <option value="Toyota">Toyota</option>
                <option value="Mercedes">Mercedes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 dark:text-white text-sm"
              >
                <option value="all">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-700 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-700 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 dark:text-white text-sm"
              >
                <option value="all">All Conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="needs-work">Needs Work</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="mileage">Lowest Mileage</option>
                <option value="year">Newest Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredCars.length} Cars Found
          </h2>
        </div>

        {filteredCars.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-12 text-center">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No cars found</h3>
            <p className="text-gray-500 dark:text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCars.map(car => (
              <div key={car.id} className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="relative h-48 md:h-full">
                      <ImageCarousel images={car.images} alt={''} />
                      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full z-10">
                        <span className="text-lg font-bold">{formatPrice(car.price)}</span>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getConditionColor(car.condition)}`}>
                          {car.condition}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white text-sm z-10">
                        <Eye className="w-4 h-4" />
                        <span>{car.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{car.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {car.year}
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-1" />
                        {car.transmission}
                      </div>
                      <div className="flex items-center">
                        <Fuel className="w-4 h-4 mr-1" />
                        {car.fuelType}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {car.location}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {car.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div>{formatMileage(car.mileage)} km</div>
                        <div className="flex items-center mt-1">
                          <Users className="w-3 h-3 mr-1" />
                          {car.ownerType}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCar(car);
                            setShowInquiryForm(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contact
                        </button>
                      </div>
                    </div>

                    {/* Contact Options */}
                    <div className="mt-4 pt-4 border-t dark:border-dark-600">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Quick Contact:</span>
                        <div className="flex space-x-2">
                          <a
                            href="tel:7735537655"
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href="https://wa.me/7735537655"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const SellSection = () => (
    <div className="space-y-8">
      {/* Sell Your Car Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sell Your Car
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          List your car on our marketplace and connect with verified buyers. 
          Get the best price with our easy-to-use platform.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Best Price</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Get competitive offers from multiple buyers and sell at the best market price
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verified Buyers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All buyers are verified for safe and secure transactions
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Sale</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            List your car and start receiving inquiries within hours
          </p>
        </div>
      </div>

      {/* Sell Car Button */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Car?</h2>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Create a detailed listing with photos and specifications. Our platform will help you 
          connect with serious buyers and get the best price for your vehicle.
        </p>
        <button
          onClick={() => setShowSellForm(true)}
          className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center mx-auto"
        >
          <Plus className="w-6 h-6 mr-2" />
          Create Listing
        </button>
      </div>

      {/* Selling Tips */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tips for a Successful Sale</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prepare Your Car</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Clean your car inside and out</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Gather all maintenance records</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Fix minor issues and dents</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Have all documents ready</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Great Listing</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Take high-quality photos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Write detailed description</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Set competitive price</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Be honest about condition</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Forms */}
      {showSellForm && (
        <SellCarForm
          onSubmit={handleSellCar}
          onCancel={() => setShowSellForm(false)}
          loading={loading}
        />
      )}

      {showInquiryForm && selectedCar && (
        <BuyCarInquiry
          car={selectedCar}
          onSubmit={handleBuyInquiry}
          onCancel={() => {
            setShowInquiryForm(false);
            setSelectedCar(null);
          }}
          loading={loading}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'buy'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              Buy Cars
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'sell'
                  ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              Sell Car
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewSection />}
      {activeTab === 'buy' && <BuySection />}
      {activeTab === 'sell' && <SellSection />}
    </div>
  );
};