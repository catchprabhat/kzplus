import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Clock, RefreshCw, UserPlus, LogIn } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { emailOtpService } from '../services/emailOtpService';

interface OTPLoginFormProps {
  onLogin: (user: { id: string; name: string; email: string; phone: string; token?: string }) => void;
  loading?: boolean;
}

export const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ onLogin, loading = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'otp' | 'register'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authLoading, setAuthLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

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
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (step === 'email' || step === 'register') {
      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email address is invalid';
      }
    }

    if (step === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
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

      // Use simulated backend for local testing if enabled
      const response = emailOtpService.simulateBackend
        ? await emailOtpService.simulateSendOTP(formData.email)
        : await emailOtpService.sendOTP(formData.email);
      
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

      // Use simulated backend for local testing if enabled
      const response = emailOtpService.simulateBackend
        ? await emailOtpService.simulateResendOTP(formData.email)
        : await emailOtpService.resendOTP(formData.email);
      
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
  
      // Use simulated backend for local testing if enabled
      const response = emailOtpService.simulateBackend
        ? await emailOtpService.simulateVerifyOTP(formData.email, formData.otp)
        : await emailOtpService.verifyOTP(formData.email, formData.otp);
      
      if (response.success) {
        if (response.user) {
          // Login both existing and new users directly
          onLogin({
            ...response.user,
            phone: response.user.phone || '' // Ensure phone is included even if undefined
          });
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

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setAuthLoading(true);
      setErrors({});

      // Use simulated backend for local testing if enabled
      const response = emailOtpService.simulateBackend
        ? await emailOtpService.simulateRegister(formData.name, formData.email)
        : await emailOtpService.register(formData.name, formData.email);
      
      if (response.success && response.user) {
        onLogin({
          ...response.user,
          phone: response.user.phone || '' // Ensure phone is included even if undefined
        });
      } else {
        setErrors({ general: response.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
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
      await handleRegister();
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
      otp: ''
    });
    setErrors({});
    setStep('email');
    setOtpSent(false);
    setOtpExpiresAt(null);
    setCountdown(0);
    setIsNewUser(false);
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
                : step === 'register'
                ? 'Complete Registration'
                : isLogin 
                ? 'Welcome Back' 
                : 'Create Account'
              }
            </h1>
            <p className="text-gray-600">
              {step === 'otp' 
                ? `Enter the 6-digit code sent to ${formData.email}`
                : step === 'register'
                ? 'Please provide your full name to complete registration'
                : isLogin 
                ? 'Sign in with email verification for secure access' 
                : 'Join A+ Auto Care with secure email verification'
              }
            </p>
          </div>

          {/* Demo Notice */}
          {step === 'email' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">🔐 Secure Email OTP Login</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Enter your email address</div>
                <div>• You'll receive a 6-digit verification code via email</div>
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
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="your.email@example.com"
                      disabled={authLoading || otpLoading}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-300"
                  disabled={authLoading || otpLoading}
                >
                  {otpLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest ${errors.otp ? 'border-red-300' : 'border-gray-300'}`}
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

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-300"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Registration (for new users) */}
            {step === 'register' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Your full name"
                      disabled={authLoading}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-300"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};