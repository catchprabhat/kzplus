import React, { useState, useEffect, useMemo } from 'react';
import { Car, Calendar, User, Phone, Mail, CreditCard, MoreVertical, Trash2, Edit, Clock, UserPlus } from 'lucide-react';
import { Booking } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { AssignDriverModal } from './AssignDriverModal';
import { cars } from '../data/cars';

interface BookingListProps {
  bookings: Booking[];
  loading?: boolean;
  onUpdateStatus?: (id: string, status: 'confirmed' | 'pending' | 'cancelled') => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  loading = false,
  onUpdateStatus,
  onDelete,
}) => {
  const [phoneFilter, setPhoneFilter] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [selectedBookingForDriver, setSelectedBookingForDriver] = useState<Booking | null>(null);
  const { user } = useAuth();
  const isAdmin =
    user?.email === 'catchprabhat@gmail.com' ||
    user?.email === 'umrsjd455@gmail.com' ||
    user?.email === 'umrsjd562@gmail.com';

  // Admin-only filters
  const [adminSearch, setAdminSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const vehicleTypeOptions = useMemo(() => {
    const typesFromCars = cars.map((c) => c.type).filter(Boolean);
    return Array.from(new Set([...typesFromCars])).sort((a, b) => a.localeCompare(b));
  }, []);

  const getCanonicalCarType = (booking: Booking) => {
    // Prefer carId when available
    if (booking.carId) {
      const byId = cars.find((c) => c.id === booking.carId);
      if (byId?.type) return byId.type;
    }
    // Fallback: normalize and fuzzy-match by name
    const normalize = (s: string) =>
      s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const bookingName = normalize(booking.carName || '');
    if (bookingName) {
      const hints: Array<{ key: string; type: string }> = [
        { key: 'innovacrysta', type: 'SUV' },
        { key: 'innova', type: 'SUV' },
        { key: 'tatasafari2023', type: 'SUV' },
        { key: 'tatasafari', type: 'SUV' },
        { key: 'safari', type: 'SUV' },
        { key: 'duster', type: 'Hatchback' },
        { key: 'baleno', type: 'Hatchback' },
        { key: 'polo', type: 'Hatchback' },
        { key: 'liva', type: 'Hatchback' },
        { key: 'octavia', type: 'Sedan' },
      ];
      for (const h of hints) {
        if (bookingName.includes(h.key) || h.key.includes(bookingName)) {
          return h.type;
        }
      }
      const match =
        cars.find((c) => normalize(c.name) === bookingName) ||
        cars.find((c) => normalize(c.name).includes(bookingName)) ||
        cars.find((c) => bookingName.includes(normalize(c.name)));
      if (match?.type) return match.type;
    }
    // Last resort: stored booking type
    return booking.carType || '';
  };

  useEffect(() => {
    // Base: exclude deleted bookings
    let filtered = bookings.filter((booking) => booking.status !== 'deleted');

    // Phone filter (applies to everyone)
    filtered = filtered.filter((booking) => {
      const matchesPhone =
        booking.customerPhone?.toLowerCase()?.includes(phoneFilter.toLowerCase()) || false;
      return matchesPhone;
    });

    // Admin-only global search
    if (isAdmin && adminSearch.trim() !== '') {
      const term = adminSearch.trim().toLowerCase();
      filtered = filtered.filter((b) => {
        const pickupDateStr = formatDate(b.pickupDate).toLowerCase();
        const dropDateStr = formatDate(b.dropDate).toLowerCase();
        const pickupTimeStr = formatTime(b.pickupDate).toLowerCase();
        const dropTimeStr = formatTime(b.dropDate).toLowerCase();
        const durationStr = calculateDuration(b.pickupDate, b.dropDate).toLowerCase();
        const priceStr = String(b.totalPrice).toLowerCase();
        const modelStr = (b.carName || '').toLowerCase();
        const typeStr = (b.carType || '').toLowerCase();
        const emailStr = (b.customerEmail || '').toLowerCase();
        const phoneStr = (b.customerPhone || '').toLowerCase();

        return (
          modelStr.includes(term) ||
          typeStr.includes(term) ||
          emailStr.includes(term) ||
          phoneStr.includes(term) ||
          pickupDateStr.includes(term) ||
          dropDateStr.includes(term) ||
          pickupTimeStr.includes(term) ||
          dropTimeStr.includes(term) ||
          durationStr.includes(term) ||
          priceStr.includes(term)
        );
      });
    }

    // Vehicle type filter (apply whenever a type is selected)
    if (vehicleFilter !== '') {
      const vf = vehicleFilter.toLowerCase();
      filtered = filtered.filter((b) => getCanonicalCarType(b).toLowerCase() === vf);
    }

    // Admin-only month filter for repeated customers (2+)
    if (isAdmin && monthFilter !== '') {
      const monthIndex = parseInt(monthFilter, 10); // 0..11 for Jan..Dec
      const monthFiltered = filtered.filter(
        (b) => new Date(b.pickupDate).getMonth() === monthIndex
      );

      const counts: Record<string, number> = {};
      monthFiltered.forEach((b) => {
        const key =
          (b.customerPhone || '').trim() ||
          (b.customerEmail || '').trim() ||
          (b.customerName || '').trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });

      filtered = monthFiltered.filter((b) => {
        const key =
          (b.customerPhone || '').trim() ||
          (b.customerEmail || '').trim() ||
          (b.customerName || '').trim();
        return key && counts[key] >= 2;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, phoneFilter, adminSearch, vehicleFilter, monthFilter, isAdmin]);

  const handleAssignDriver = (booking: Booking) => {
    setSelectedBookingForDriver(booking);
    setShowAssignDriverModal(true);
    setOpenDropdown(null);
  };

  const closeAssignDriverModal = () => {
    setShowAssignDriverModal(false);
    setSelectedBookingForDriver(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date.toString()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date.toString()).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (pickupDate: Date, dropDate: Date) => {
    const pickup = new Date(pickupDate);
    const drop = new Date(dropDate);
    const diffTime = drop.getTime() - pickup.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays === 0) {
      // Same day booking - show only hours
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (remainingHours === 0) {
      // Exact days - show only days
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      // Mixed days and hours
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  };

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    if (!onUpdateStatus) return;
    
    try {
      setActionLoading(id);
      await onUpdateStatus(id, status);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        setActionLoading(id);
        await onDelete(id);
        setOpenDropdown(null);
      } catch (error) {
        console.error('Error deleting booking:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6 flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6">
      {/* header + filters */}
      <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Recent Bookings
        </h3>
        
        {/* Filter group: admin filters then phone filter */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto min-w-0">
          {isAdmin && (
            <>
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search"
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                title="Search by vehicle model, date, time, price, duration, email, phone number, vehicle type"
              />

              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                title="Filter by vehicle type"
              >
                <option value="">All vehicles</option>
                {vehicleTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                title="Show repeated customers (2+) in selected month"
              >
                <option value="">All months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </>
          )}

          {/* Mobile-responsive phone filter input */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Filter by phone number"
              className="w-full sm:w-64 px-4 py-2 pr-10 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
            <Phone className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Mobile-optimized booking cards / inline empty state */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              {/* booking card content */}
              <div className="flex flex-col space-y-2 mb-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm sm:text-base">
                    <Car className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.carName}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(booking.pickupDate)} - {formatDate(booking.dropDate)}
                  </p>
                </div>
                
                {/* Status and actions - mobile optimized */}
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {(onUpdateStatus || onDelete) && booking.status !== 'deleted' && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === booking.id ? null : booking.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-full transition-colors"
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      
                      {/* Dropdown menu - mobile optimized */}
                      {openDropdown === booking.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white dark:bg-dark-700 rounded-md shadow-lg border dark:border-dark-600 z-10">
                          <div className="py-1">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleAssignDriver(booking)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center"
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Assign Driver
                                </button>
                                {onUpdateStatus && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center"
                                      disabled={booking.status === 'confirmed'}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Mark Confirmed
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                      className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center"
                                      disabled={booking.status === 'cancelled'}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Mark Cancelled
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            {/* Move delete option outside admin check */}
                            {onDelete && (
                              <>
                                {isAdmin && <hr className="my-1 border-gray-200 dark:border-dark-600" />}
                                <button
                                  onClick={() => handleDelete(booking.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Booking
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking details - mobile-first grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-gray-400">
                {/* Customer info */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{booking.customerPhone}</span>
                  </div>
                </div>

                {/* Booking details */}
                <div className="space-y-2">
                  {/* Pickup and Drop Times */}
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {formatTime(booking.pickupDate)} - {formatTime(booking.dropDate)}
                    </span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{calculateDuration(booking.pickupDate, booking.dropDate)}</span>
                  </div>
                  
                  {/* Price Section - mobile optimized */}
                  <div className="space-y-1">
                    {booking.originalPrice && booking.discountAmount ? (
                      <>
                        <div className="flex items-center text-sm text-gray-500 line-through">
                          <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">₹{booking.originalPrice}</span>
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <span className="mr-2">💰</span>
                          <span className="text-xs sm:text-sm">
                            Saved ₹{booking.discountAmount} {booking.couponCode && `(${booking.couponCode})`}
                          </span>
                        </div>
                        <div className="flex items-center font-semibold text-blue-600">
                          <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base">₹{booking.totalPrice}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center font-semibold text-blue-600">
                        <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base">₹{booking.totalPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
      ) : (
        <div className="border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg p-6 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            No bookings match your filters.
          </p>
        </div>
      )}
    
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={showAssignDriverModal}
        onClose={closeAssignDriverModal}
        booking={selectedBookingForDriver}
      />
    </div>
  );
};