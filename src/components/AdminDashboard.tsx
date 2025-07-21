import React, { useState } from 'react';
import { 
  Car, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { CarSubmission } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface AdminDashboardProps {
  submissions: CarSubmission[];
  onApprove: (id: string, adminNotes?: string) => void;
  onReject: (id: string, reason: string, adminNotes?: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  submissions,
  onApprove,
  onReject,
  onDelete,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'approved' | 'rejected'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<CarSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter submissions based on active tab
  const getFilteredSubmissions = () => {
    let filtered = submissions;

    // Filter by status
    if (activeTab !== 'overview') {
      filtered = filtered.filter(sub => sub.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.ownerDetails.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by car type
    if (filterType !== 'all') {
      filtered = filtered.filter(sub => sub.type === filterType);
    }

    return filtered;
  };

  // Get statistics
  const getStats = () => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    const totalRevenue = approved * 50; // Assuming $50 commission per approved car

    return { total, pending, approved, rejected, totalRevenue };
  };

  const stats = getStats();
  const filteredSubmissions = getFilteredSubmissions();

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onApprove(id, 'Car approved for listing');
    } catch (error) {
      console.error('Failed to approve submission:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onReject(id, reason, 'Car rejected due to provided reason');
    } catch (error) {
      console.error('Failed to reject submission:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      setActionLoading(id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onDelete(id);
    } catch (error) {
      console.error('Failed to delete submission:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const carTypes = ['all', 'Sedan', 'SUV', 'Hatchback', 'Sports', 'Electric', 'Luxury'];

  return (
    <div className="space-y-8">
      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b dark:border-dark-600">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedSubmission.name}
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Car Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Model:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Year:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.seats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.transmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fuel:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.fuel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price/Day:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">${selectedSubmission.pricePerDay}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owner Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.ownerDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.ownerDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.ownerDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">License:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.ownerDetails.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedSubmission.description}</p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {selectedSubmission.status === 'pending' && (
              <div className="p-6 border-t dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleReject(selectedSubmission.id)}
                    disabled={actionLoading === selectedSubmission.id}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    {actionLoading === selectedSubmission.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    disabled={actionLoading === selectedSubmission.id}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    {actionLoading === selectedSubmission.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage car submissions and approvals</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Cars</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${stats.totalRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg">
        <div className="border-b dark:border-dark-600">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b dark:border-dark-600">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cars, brands, or owners..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 dark:text-white"
              >
                {carTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading submissions..." />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {activeTab === 'overview' 
                  ? 'No car submissions yet. Users can submit cars from their profile section.'
                  : `No ${activeTab} submissions found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map(submission => (
                <div
                  key={submission.id}
                  className="border dark:border-dark-600 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {submission.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Brand:</span> {submission.brand}
                        </div>
                        <div>
                          <span className="font-medium">Model:</span> {submission.model}
                        </div>
                        <div>
                          <span className="font-medium">Year:</span> {submission.year}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> 
                          <span className="text-green-600 dark:text-green-400 font-semibold"> ${submission.pricePerDay}/day</span>
                        </div>
                        <div>
                          <span className="font-medium">Owner:</span> {submission.ownerDetails.name}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {formatDate(submission.submittedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {submission.type}
                        </div>
                        <div>
                          <span className="font-medium">Seats:</span> {submission.seats}
                        </div>
                      </div>

                      {submission.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-300">Rejection Reason:</span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{submission.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            disabled={actionLoading === submission.id}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            {actionLoading === submission.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(submission.id)}
                            disabled={actionLoading === submission.id}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={actionLoading === submission.id}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};