import React, { useState, useEffect } from 'react';
import { Calendar, User, Car, Phone, Mail, Clock, DollarSign, MoreVertical, Edit, Trash2, CheckCircle } from 'lucide-react';
import { ServiceBooking } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

interface ServiceBookingListProps {
  bookings: ServiceBooking[];
  loading?: boolean;
  onUpdateStatus?: (id: string, status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled') => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ServiceBookingList: React.FC<ServiceBookingListProps> = ({
  bookings,
  loading = false,
  onUpdateStatus,
  onDelete
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<ServiceBooking[]>([]);
  const [phoneFilter, setPhoneFilter] = useState('');
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin =
    user?.email === 'catchprabhat@gmail.com' ||
    user?.email === 'umrsjd455@gmail.com' ||
    user?.email === 'umrsjd562@gmail.com';

  // Admin-only month filter
  const [monthFilter, setMonthFilter] = useState<string>(''); // '' means no month filter

  // Track if any filter is applied
  const filtersApplied = (isAdmin && monthFilter !== '') || phoneFilter.trim() !== '';

  useEffect(() => {
    // Base: exclude deleted bookings
    let filtered = bookings.filter((booking) => booking.status !== 'deleted');

    // Apply phone filter
    if (phoneFilter.trim()) {
      const term = phoneFilter.toLowerCase();
      filtered = filtered.filter((b) =>
        (b.customerPhone || '').toLowerCase().includes(term)
      );
    }

    // Admin-only month filter: show repeated customers (2+ bookings) in selected month
    if (isAdmin && monthFilter !== '') {
      const monthIndex = parseInt(monthFilter, 10); // 0..11 for Jan..Dec
      const monthFiltered = filtered.filter((b) => {
        const d = new Date(b.scheduledDate);
        return d.getMonth() === monthIndex;
      });

      // Group by customer (prefer phone, fallback to email/name)
      const counts: Record<string, number> = {};
      monthFiltered.forEach((b) => {
        const key =
          (b.customerPhone || '').trim() ||
          (b.customerEmail || '').trim() ||
          (b.customerName || '').trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });

      // Keep only bookings from customers with 2+ bookings in that month
      filtered = monthFiltered.filter((b) => {
        const key =
          (b.customerPhone || '').trim() ||
          (b.customerEmail || '').trim() ||
          (b.customerName || '').trim();
        return key && counts[key] >= 2;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, phoneFilter, monthFilter, isAdmin]);
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const handleStatusUpdate = async (id: string, status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled') => {
    if (!onUpdateStatus) return;
    
    try {
      setActionLoading(id);
      await onUpdateStatus(id, status);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to update service booking status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to cancel this service booking?')) {
      try {
        setActionLoading(id);
        await onDelete(id);
        setOpenDropdown(null);
        
        // Show success message
        alert('Service booking cancelled successfully!');
        console.log('Service booking cancelled successfully');
      } catch (error) {
        console.error('Failed to cancel service booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to cancel service booking: ${errorMessage}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!onUpdateStatus) return;
    
    try {
      setActionLoading(id);
      
      // Map display text to actual status values
      const statusMap: { [key: string]: string } = {
        'Mark as Confirmed': 'confirmed',
        'Mark as In Progress': 'in-progress',
        'Mark as Completed': 'completed',
        'Mark as Cancelled': 'cancelled'
      };
      
      const mappedStatus = statusMap[newStatus] || newStatus;
      console.log('Updating status:', { id, newStatus, mappedStatus });
      
      await onUpdateStatus(id, mappedStatus as any);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Add debugging
  console.log('ServiceBookingList received:', {
    bookingsCount: bookings.length,
    loading,
    bookings: bookings
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-8">
        <LoadingSpinner size="lg" text="Loading service bookings..." />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-8 text-center">
        <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Service Bookings Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Your car service bookings will appear here once you schedule a service.</p>
      </div>
    );
  }

  // [FIX] Remove this early return so filters remain visible even when the list is empty
  // if (filtersApplied && filteredBookings.length === 0) {
  //   return (
  //     <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-8 text-center">
  //       <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
  //       <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No matching bookings</h3>
  //       <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
  //         Try a different month or phone number. For the selected month, no customers have 2 or more bookings.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header with filters - always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="truncate">Service Bookings</span>
        </h3>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-36 sm:w-40 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter repeated customers by month"
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
          )}

          <div className="relative flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by phone number"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* List area with inline empty state */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
              {/* Mobile-First Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm sm:text-base">
                    <Car className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.vehicleName} ({booking.vehicleNumber})</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime)}
                  </p>
                </div>
                
                {/* Status and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} flex-shrink-0`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                  </span>
                  {(onUpdateStatus || onDelete) && booking.status !== 'deleted' && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === booking.id ? null : booking.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-full transition-colors touch-manipulation"
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      
                      {openDropdown === booking.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg shadow-lg z-10">
                          {/* Show status update options only for admin */}
                          {onUpdateStatus && isAdmin && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 flex items-center touch-manipulation"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Confirmed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'in-progress')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 flex items-center touch-manipulation"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark as In Progress
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 flex items-center touch-manipulation"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600 flex items-center touch-manipulation"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Mark as Cancelled
                              </button>
                            </>
                          )}
                          {/* Show delete option only if not already deleted */}
                          {onDelete && booking.status !== 'deleted' && (
                            <>
                              {onUpdateStatus && isAdmin && <hr className="my-1 border-gray-200 dark:border-dark-600" />}
                              <button
                                onClick={() => handleDelete(booking.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center touch-manipulation"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Booking
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Responsive Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Customer Details */}
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Customer Details</h5>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{booking.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{booking.customerEmail}</span>
                    </div>
                  </div>
                </div>
                
                {/* Services & Pricing */}
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Services & Pricing</h5>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {booking.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="truncate mr-2">{service.name}</span>
                        <span className="flex-shrink-0 font-medium">₹{service.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center font-semibold text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-dark-600 pt-1 mt-2">
                      <span>Total:</span>
                      <span>₹{booking.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm sm:text-base">Notes</h5>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{booking.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 sm:p-8 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 text-center">
            <Car className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-300 mb-1">No matching bookings</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Try a different month or phone number. For the selected month, no customers have 2 or more bookings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this to your booking display logic
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'deleted':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Deleted
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Confirmed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Cancelled
        </span>
      );
    default:
      return status;
  }
};