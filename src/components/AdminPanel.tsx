import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { User, Lock } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  vehicle_count: number;
  booking_count: number;
}

interface ErrorResponse {
  error?: string;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password,
      });
      setToken(response.data.token);
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      fetchUsers(response.data.token);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUsers([]);
  };

  useEffect(() => {
    if (token) {
      fetchUsers(token);
    }
  }, [token]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {!isAuthenticated ? (
        <motion.div
          className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6"
          variants={cardVariants}
          custom={0}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Lock className="w-6 h-6 mr-2 text-blue-600" />
            Admin Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 ${
                loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Login'}
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Registered Users</h2>
            <motion.button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600 text-center">No users registered yet.</p>
          ) : (
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              variants={cardVariants}
              custom={0}
            >
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vehicles</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Bookings</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      variants={cardVariants}
                      custom={index + 1}
                      initial="hidden"
                      animate="visible"
                    >
                      <td className="px-4 py-2 text-sm text-gray-600">{user.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.address || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.vehicle_count}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.booking_count}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;