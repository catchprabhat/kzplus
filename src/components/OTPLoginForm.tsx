import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Shield, Clock, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { otpService } from '../services/otpService';

interface OTPLoginFormProps {
  onLogin: (user: { id: string; name: string; email: string; phone: string }) => void;
  loading?: boolean;
}

export const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onLogin, loading = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'register'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authLoading, setAuthLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);

  // Countdown timer for OTP expiry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (otpExpiresAt && countdown > 0) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((otpExpiresAt.getTime() - Date.now()) / 1000));
        setCountdown(remaining);
        
        if (remaining === 0) {
          setOtpSent(false);
          setOtpExpiresAt(null);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpExpiresAt, countdown]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (step === 'email' || step === 'register') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }

    if (step === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 'otp') {
      if (!formData.otp) {
        newErrors.otp = 'Verification code is required';
      } else if (formData.otp.length !== 6) {
        newErrors.otp = 'Verification code must be 6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    try {
      setOtpLoading(true);
      setErrors({});

      const response = await otpService.sendOTP(formData.email);
      
      if (response.success) {
        setOtpSent(true);
        setStep('otp');
        const expiresAt = new Date(Date.now() + (response.expiresIn || 600) * 1000);
        setOtpExpiresAt(expiresAt);
        setCountdown(response.expiresIn || 600);
      } else {
        setErrors({ email: response.message });
      }
    } catch (error) {
      setErrors({ email: 'Failed to send verification code. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setErrors({});

      const response = await otpService.resendOTP(formData.email);
      
      if (response.success) {
        const expiresAt = new Date(Date.now() + (response.expiresIn || 600) * 1000);
        setOtpExpiresAt(expiresAt);
        setCountdown(response.expiresIn || 600);
        setOtpSent(true);
      } else {
        setErrors({ otp: response.message });
      }
    } catch (error) {
      setErrors({ otp: 'Failed to resend verification code. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) return;

    try {
      setAuthLoading(true);
      setErrors({});

      const response = await otpService.verifyOTP(formData.email, formData.otp);
      
      if (response.success) {
        // OTP verified successfully, complete login
        if (isLogin) {
          // For existing users - simulate user lookup
          const user = {
            id: 'user-' + Date.now(),
            name: 'John Doe', // In real app, fetch from database
            email: formData.email,
            phone: '+1-555-0123' // In real app, fetch from database
          };
          onLogin(user);
        } else {
          // For new users - complete registration
          const user = {
            id: 'user-' + Date.now(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          };
          onLogin(user);
        }
      } else {
        setErrors({ otp: response.message });
      }
    } catch (error) {
      setErrors({ otp: 'Verification failed. Please try again.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'email') {
      await handleSendOTP();
    } else if (step === 'otp') {
      await handleVerifyOTP();
    } else if (step === 'register') {
      if (validateForm()) {
        setStep('email');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
    setErrors({});
    setStep('email');
    setOtpSent(false);
    setOtpExpiresAt(null);
    setCountdown(0);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'otp' ? (
                <Shield className="w-8 h-8 text-blue-600" />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'otp' 
                ? 'Verify Your Email' 
                : isLogin 
                ? 'Welcome Back' 
                : 'Create Account'
              }
            </h1>
            <p className="text-gray-600">
              {step === 'otp' 
                ? `Enter the 6-digit code sent to ${formData.email}`
                : isLogin 
                ? 'Sign in with email verification for secure access' 
                : 'Join DriveEasy with secure email verification'
              }
            </p>
          </div>

          {/* Demo Notice */}
          {step === 'email' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">🔐 Secure Email OTP Login</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Enter any valid email address</div>
                <div>• Check console for the 6-digit verification code</div>
                <div>• Code expires in 10 minutes</div>
                <div>• Maximum 3 attempts per code</div>
              </div>
            </div>
          )}

          {/* OTP Status */}
          {step === 'otp' && otpExpiresAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Code expires in:</span>
                </div>
                <span className="text-green-900 font-bold text-lg">
                  {formatTime(countdown)}
                </span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                Check your email inbox and spam folder for the verification code
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  disabled={authLoading || otpLoading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            {(step === 'email' || step === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={authLoading || otpLoading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            )}

            {step === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                    disabled={authLoading || otpLoading}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                      disabled={authLoading || otpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={authLoading || otpLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    disabled={authLoading || otpLoading}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </>
            )}

            {step === 'otp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest ${
                    errors.otp ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={authLoading}
                />
                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                
                {/* Resend OTP */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading || countdown > 540} // Allow resend in last 60 seconds
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {resendLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || otpLoading || resendLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center"
            >
              {(authLoading || otpLoading) ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {step === 'otp' ? (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify & Sign In
                    </>
                  ) : step === 'register' ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Continue to Verification
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Back Button for OTP step */}
          {step === 'otp' && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setStep('email');
                  setFormData(prev => ({ ...prev, otp: '' }));
                  setErrors({});
                }}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
                disabled={authLoading}
              >
                ← Back to email
              </button>
            </div>
          )}

          {/* Toggle Form */}
          {step !== 'otp' && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold"
                  disabled={authLoading || otpLoading}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Email OTP</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Secure Login</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">10 Min Expiry</p>
          </div>
        </div>
      </div>
    </div>
  );
};