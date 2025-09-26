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
  const [filteredBookings, setFilteredBookings] = useState<ServiceBooking[]>(bookings);
  const [phoneFilter, setPhoneFilter] = useState('');
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email === 'catchprabhat@gmail.com';

  // Move this useEffect inside the component
  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const matchesPhone = booking.customerPhone?.toLowerCase()?.includes(phoneFilter.toLowerCase()) || false;
      // Filter out deleted bookings from frontend display
      const isNotDeleted = booking.status !== 'deleted';
      return matchesPhone && isNotDeleted;
    });
    setFilteredBookings(filtered);
  }, [bookings, phoneFilter]);

  // Move this function inside the component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Confirmed' },
      'in-progress': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'In Progress' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Completed' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Cancelled' },
      deleted: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', label: 'Deleted' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

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
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8">
        <LoadingSpinner size="lg" text="Loading service bookings..." />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8 text-center">
        <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Service Bookings Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Your car service bookings will appear here once you schedule a service.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Debug: {bookings.length} bookings found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
        Service Bookings
      </h3>
      
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  {booking.vehicleName} ({booking.vehicleNumber})
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                </span>
                {(onUpdateStatus || onDelete) && booking.status !== 'deleted' && (
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
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Confirmed
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'in-progress')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Mark as In Progress
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Completed
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
                        {/* Show delete option only if not already deleted */}
                        {onDelete && booking.status !== 'deleted' && (
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
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Customer Details</h5>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {booking.customerName}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.customerPhone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {booking.customerEmail}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Services & Pricing</h5>
                <div className="space-y-1 text-sm text-gray-400">
                  {booking.services.map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>₹{service.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-blue-600 border-t pt-1">
                    <span>Total:</span>
                    <span>₹{booking.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                <p className="text-sm text-gray-600">{booking.notes}</p>
              </div>
            )}
          </div>
        ))}
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