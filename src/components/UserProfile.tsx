import React, { useState } from 'react';
import { User, Mail, Phone, LogOut, Edit, Save, X, Camera, Plus, Car } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageUpload } from './ImageUpload';
import { CarSubmissionForm } from './CarSubmissionForm';
import { CarSubmission } from '../types';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  onLogout: () => void;
  onUpdateProfile: (user: { id: string; name: string; email: string; phone: string; profileImage?: string }) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCarSubmissionForm, setShowCarSubmissionForm] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage || ''
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [carSubmissionLoading, setCarSubmissionLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!editData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!editData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        profileImage: editData.profileImage
      };
      
      onUpdateProfile(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleImageChange = (imageUrl: string) => {
    setEditData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const handleCarSubmission = async (submission: CarSubmission) => {
    try {
      setCarSubmissionLoading(true);
      
      // Simulate API call to submit car for approval
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Car submission:', submission);
      
      // Show success message
      alert('🚗 Car submitted successfully! Your submission will be reviewed by our admin team and you\'ll be notified once it\'s approved for listing.');
      
      setShowCarSubmissionForm(false);
    } catch (error) {
      console.error('Failed to submit car:', error);
      alert('Failed to submit car. Please try again.');
    } finally {
      setCarSubmissionLoading(false);
    }
  };

  return (
    <>
      {/* Car Submission Form Modal */}
      {showCarSubmissionForm && (
        <CarSubmissionForm
          onSubmit={handleCarSubmission}
          onCancel={() => setShowCarSubmissionForm(false)}
          loading={carSubmissionLoading}
        />
      )}

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-2">User Profile</h3>
          <p className="text-gray-600 dark:text-gray-300">Manage your account information and profile picture</p>
        </div>

        {/* Profile Image Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4 flex items-center justify-center">
              <Camera className="w-5 h-5 mr-2" />
              Profile Picture
            </h4>
          </div>

          {isEditing ? (
            <ImageUpload
              currentImage={editData.profileImage}
              onImageChange={handleImageChange}
              loading={imageUploading}
            />
          ) : (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-700 border-4 border-white dark:border-dark-600 shadow-lg">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Edit Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-black ${
                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-gray-900 dark:text-white">
                {user.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            {isEditing ? (
              <div>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-black ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-gray-900 dark:text-white">
                {user.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all dark:bg-dark-700 dark:text-black ${
                    errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-gray-900 dark:text-white">
                {user.phone}
              </div>
            )}
          </div>
        </div>

        {/* Car Submission Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Car Listing
          </h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <div className="text-center">
              <Car className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                List Your Car for Rental
              </h5>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                Have a car you'd like to rent out? Submit it for approval and start earning money from your vehicle.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-white dark:bg-dark-800 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h6 className="font-semibold text-gray-900 dark:text-white">Submit Details</h6>
                  <p className="text-gray-600 dark:text-gray-400">Provide car information and documents</p>
                </div>
                
                <div className="bg-white dark:bg-dark-800 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Edit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h6 className="font-semibold text-gray-900 dark:text-white">Admin Review</h6>
                  <p className="text-gray-600 dark:text-gray-400">Our team reviews your submission</p>
                </div>
                
                <div className="bg-white dark:bg-dark-800 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h6 className="font-semibold text-gray-900 dark:text-white">Start Earning</h6>
                  <p className="text-gray-600 dark:text-gray-400">Car gets listed for rental</p>
                </div>
              </div>

              <button
                onClick={() => setShowCarSubmissionForm(true)}
                disabled={isEditing || loading || carSubmissionLoading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white disabled:text-gray-500 px-6 py-3 rounded-lg font-semibold transition-all flex items-center mx-auto"
              >
                {carSubmissionLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Car
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white disabled:text-gray-500 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white disabled:text-gray-500 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Profile Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <div className="text-sm text-blue-800 dark:text-blue-300">Total Bookings</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
              <div className="text-sm text-green-800 dark:text-green-300">Services Used</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
