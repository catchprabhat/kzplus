import React, { useState, useEffect } from 'react';
import { Car, Calendar, User, Phone, Mail, CreditCard, MoreVertical, Trash2, Edit, Clock } from 'lucide-react';
import { Booking } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings);
  const [phoneFilter, setPhoneFilter] = useState('');
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email === 'catchprabhat@gmail.com';

  useEffect(() => {
    // Filter bookings based on phoneFilter
    const filtered = bookings.filter((booking) =>
      booking.customerPhone.toLowerCase().includes(phoneFilter.toLowerCase())
    );
    setFilteredBookings(filtered);
  }, [bookings, phoneFilter]);

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
      // Mixed duration - show days and hours
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    if (!onUpdateStatus) return;
    
    setActionLoading(id);
    setOpenDropdown(null);
    
    try {
      await onUpdateStatus(id, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setActionLoading(id);
      setOpenDropdown(null);
      
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting booking:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 text-center">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Bookings Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Your car bookings will appear here once you make a reservation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Recent Bookings
        </h3>
        <div className="relative">
          <input
            type="text"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            placeholder="Filter by phone number"
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
          />
          <Phone className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  {booking.carName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(booking.pickupDate)} - {formatDate(booking.dropDate)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                {(onUpdateStatus || onDelete) && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === booking.id ? null : booking.id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {openDropdown === booking.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {/* Show status update options only for admin */}
                        {onUpdateStatus && isAdmin && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Mark as Confirmed
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'pending')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Mark as Pending
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Mark as Cancelled
                            </button>
                          </>
                        )}
                        {/* Show delete option for all users */}
                        {onDelete && (
                          <>
                            {onUpdateStatus && isAdmin && <hr className="my-1" />}
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
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

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="space-y-1">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {booking.customerName}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {booking.customerEmail}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {booking.customerPhone}
                </div>
              </div>

              <div className="space-y-1">
                {/* Pickup and Drop Times */}
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(booking.pickupDate)} - {formatTime(booking.dropDate)}
                </div>
                
                {/* Duration */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {calculateDuration(booking.pickupDate, booking.dropDate)}
                </div>
                
                {/* Price Section */}
                <div className="space-y-1">
                  {booking.originalPrice && booking.discountAmount ? (
                    <>
                      <div className="flex items-center text-sm text-gray-500 line-through">
                        <CreditCard className="w-4 h-4 mr-2" />
                        ₹{booking.originalPrice}
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <span className="mr-2">💰</span>
                        Saved ₹{booking.discountAmount} {booking.couponCode && `(${booking.couponCode})`}
                      </div>
                      <div className="flex items-center font-semibold text-blue-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        ₹{booking.totalPrice}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center font-semibold text-blue-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      ₹{booking.totalPrice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};