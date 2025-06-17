import React, { useState } from 'react';
import { User, Mail, Phone, LogOut, Edit, Save, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onLogout: () => void;
  onUpdateProfile: (user: { id: string; name: string; email: string; phone: string }) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone
  });
  const [loading, setLoading] = useState(false);
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
        phone: editData.phone
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
      phone: user.phone
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {user.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address
          </label>
          {isEditing ? (
            <div>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {user.email}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          {isEditing ? (
            <div>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
                disabled={loading}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
              {user.phone}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
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
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};