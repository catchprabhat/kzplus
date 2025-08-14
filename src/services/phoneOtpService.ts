import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    token: string;
  };
  isNewUser?: boolean;
}

class PhoneOTPService {
  // Send OTP to phone number
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(phone: string, otp: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Resend OTP
  async resendOTP(phone: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, { phone });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to resend verification code. Please try again.'
      };
    }
  }

  // Register new user
  async register(name: string, phone: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, phone });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }
}

export const phoneOtpService = new PhoneOTPService();
export default PhoneOTPService;