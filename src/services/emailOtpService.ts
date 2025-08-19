import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    token: string;
  };
  isNewUser?: boolean;
}

class EmailOTPService {
  // Send OTP to email
  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/send-email-otp`, { email });
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
  async verifyOTP(email: string, otp: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email-otp`, { email, otp });
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
  async resendOTP(email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-email-otp`, { email });
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
  async register(name: string, email: string): Promise<OTPResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register-email`, { name, email });
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

  // For local development/testing without backend
  // This simulates the backend functionality using localStorage
  simulateBackend = false;

  // Simulate backend for local testing
  private simulateOTPStorage: Map<string, {otp: string, expiresAt: Date, attempts: number}> = new Map();

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Simulate sending OTP
  async simulateSendOTP(email: string): Promise<OTPResponse> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.simulateOTPStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    console.log(`📧 [SIMULATED] OTP sent to ${email}: ${otp}`);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
      expiresIn: 10 * 60 // 10 minutes in seconds
    };
  }

  // Simulate verifying OTP
  async simulateVerifyOTP(email: string, inputOTP: string): Promise<OTPResponse> {
    const otpData = this.simulateOTPStorage.get(email);

    if (!otpData) {
      return {
        success: false,
        message: 'No verification code found. Please request a new code.'
      };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.simulateOTPStorage.delete(email);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Check if max attempts exceeded
    if (otpData.attempts > 3) {
      this.simulateOTPStorage.delete(email);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      };
    }

    // Verify OTP
    if (otpData.otp === inputOTP.trim()) {
      // Check if user exists in localStorage
      const usersJSON = localStorage.getItem('simulatedUsers');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        // User exists, return user data
        return {
          success: true,
          message: 'Login successful',
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone || '',
            token: `simulated-token-${Date.now()}`
          },
          isNewUser: false
        };
      } else {
        // User doesn't exist, return as new user
        return {
          success: true,
          message: 'Login successful. Please complete your profile.',
          isNewUser: true
        };
      }
    } else {
      const remainingAttempts = 3 - otpData.attempts;
      return {
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
      };
    }
  }

  // Simulate resending OTP
  async simulateResendOTP(email: string): Promise<OTPResponse> {
    return this.simulateSendOTP(email);
  }

  // Simulate registering a new user
  async simulateRegister(name: string, email: string): Promise<OTPResponse> {
    // Get existing users or create empty array
    const usersJSON = localStorage.getItem('simulatedUsers');
    const users = usersJSON ? JSON.parse(usersJSON) : [];

    // Check if user already exists
    const existingUserIndex = users.findIndex((u: any) => u.email === email);

    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex].name = name;
      localStorage.setItem('simulatedUsers', JSON.stringify(users));

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: users[existingUserIndex].id,
          name,
          email,
          phone: users[existingUserIndex].phone || '',
          token: `simulated-token-${Date.now()}`
        }
      };
    } else {
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone: '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('simulatedUsers', JSON.stringify(users));

      return {
        success: true,
        message: 'Registration successful',
        user: {
          ...newUser,
          token: `simulated-token-${Date.now()}`
        }
      };
    }
  }
}

export const emailOtpService = new EmailOTPService();
export default EmailOTPService;