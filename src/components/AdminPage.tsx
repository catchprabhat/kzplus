import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { useCarSubmissions } from '../hooks/useCarSubmissions';
import { useAuth } from '../hooks/useAuth';
import { Shield, ArrowLeft } from 'lucide-react';

interface AdminPageProps {
  onBackToHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    submissions,
    loading: submissionsLoading,
    error: submissionsError,
    fetchSubmissions,
    createSubmission,
    approveSubmission,
    rejectSubmission,
    deleteSubmission
  } = useCarSubmissions();

  // Check if user is admin (in real app, this would be based on user role)
  // Check if user is admin
  const isAdmin = user?.email === 'catchprabhat@gmail.com' || user?.email === 'umrsjd455@gmail.com';

  // Check authentication and admin access
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {!isAuthenticated 
              ? 'You need to be logged in to access the admin dashboard.'
              : 'You don\'t have permission to access the admin dashboard.'
            }
          </p>
          <button
            onClick={onBackToHome}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-300">
      {/* Admin Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b dark:border-dark-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={onBackToHome}
                className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    DriveEasy Admin
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Car Submission Management
                  </p>
                </div>
              </div>
            </div>
            
            {/* Admin User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard
          submissions={submissions}
          onApprove={approveSubmission}
          onReject={rejectSubmission}
          onDelete={deleteSubmission}
          loading={submissionsLoading}
        />
      </main>

      {/* Admin Footer */}
      <footer className="bg-gray-900 dark:bg-dark-950 text-white mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 mr-2" />
              <span className="text-xl font-bold">DriveEasy Admin</span>
            </div>
            <p className="text-gray-400 text-sm">
              Secure administrative interface for car submission management
            </p>
            <div className="mt-4 text-xs text-gray-500">
              <p>&copy; 2025 DriveEasy. Admin Dashboard v1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};