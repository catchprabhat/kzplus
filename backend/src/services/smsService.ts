import { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// OTP data structure
export interface OTPData {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  isVerified: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

class SMSService {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly twilioClient: Twilio;

  constructor() {
    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.warn('Twilio credentials not found. SMS sending will be simulated.');
    }

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  // Generate a random 6-digit OTP
  // Fix the unused variable by using it in the generateOTP function
  private generateOTP(): string {
    // Use the OTP_LENGTH constant instead of hardcoding 6 digits
    const min = Math.pow(10, this.OTP_LENGTH - 1);
    const max = Math.pow(10, this.OTP_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  // Send OTP via SMS
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phone)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please enter a valid phone number.'
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP data
      this.otpStorage.set(phone, {
        phone,
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false
      });

      // Send SMS via Twilio
      const message = `Your A+ Auto Care verification code is: ${otp}. This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.`;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone) {
        try {
          // Ensure phone number is in E.164 format
          const formattedPhone = this.formatToE164(phone);
          
          console.log(`Attempting to send SMS to ${formattedPhone} using Twilio`);
          
          const result = await this.twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone
          });
          
          console.log(`Twilio SMS sent successfully. SID: ${result.sid}`);
          
          return {
            success: true,
            message: `Verification code sent to ${phone}`,
            expiresIn: this.OTP_EXPIRY_MINUTES * 60 // in seconds
          };
        } catch (twilioError: any) {
          console.error('Twilio error:', twilioError.message);
          console.error('Twilio error code:', twilioError.code);
          console.error('Twilio error details:', JSON.stringify(twilioError, null, 2));
          
          // Fall back to simulation if Twilio fails
          await this.simulateSMSSend(phone, message);
          
          return {
            success: true,
            message: `Verification code sent to ${phone} (simulated due to Twilio error)`,
            expiresIn: this.OTP_EXPIRY_MINUTES * 60 // in seconds
          };
        }
      } else {
        // Simulate SMS sending if no Twilio credentials
        console.log('No Twilio credentials found. Simulating SMS send.');
        await this.simulateSMSSend(phone, message);
        
        return {
          success: true,
          message: `Verification code sent to ${phone} (simulated)`,
          expiresIn: this.OTP_EXPIRY_MINUTES * 60 // in seconds
        };
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(phone: string, inputOTP: string): Promise<OTPResponse> {
    const otpData = this.otpStorage.get(phone);

    if (!otpData) {
      return {
        success: false,
        message: 'No verification code found. Please request a new code.'
      };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(phone);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(phone);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp === inputOTP.trim()) {
      otpData.isVerified = true;
      // Keep the verified OTP for a short time to allow login completion
      setTimeout(() => {
        this.otpStorage.delete(phone);
      }, 5 * 60 * 1000); // 5 minutes

      return {
        success: true,
        message: 'Verification successful! You can now access your account.'
      };
    } else {
      const remainingAttempts = this.MAX_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
      };
    }
  }

  // Check if OTP is verified (for login completion)
  isOTPVerified(phone: string): boolean {
    const otpData = this.otpStorage.get(phone);
    return otpData?.isVerified === true && new Date() <= otpData.expiresAt;
  }

  // Resend OTP (with rate limiting)
  async resendOTP(phone: string): Promise<OTPResponse> {
    const otpData = this.otpStorage.get(phone);
    
    if (otpData) {
      // Check if enough time has passed since last send (prevent spam)
      const timeSinceLastSend = Date.now() - (otpData.expiresAt.getTime() - this.OTP_EXPIRY_MINUTES * 60 * 1000);
      const minResendInterval = 60 * 1000; // 1 minute

      if (timeSinceLastSend < minResendInterval) {
        const waitTime = Math.ceil((minResendInterval - timeSinceLastSend) / 1000);
        return {
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new code.`
        };
      }
    }

    return this.sendOTP(phone);
  }

  // Clean up expired OTPs (call periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [phone, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(phone);
      }
    }
  }

  // Validate phone number format
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - can be enhanced with more sophisticated validation
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s+/g, ''));
  }
  
  // Format phone number to E.164 format
  private formatToE164(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // If the number doesn't start with a plus sign, add the country code
    if (!phone.startsWith('+')) {
      // Default to US/Canada (+1) if no country code
      if (digits.length === 10) {
        return `+1${digits}`;
      } else {
        // If it already has a country code, add a plus
        return `+${digits}`;
      }
    }
    
    // If it already has a plus, just return the cleaned version
    return `+${digits}`;
  }

  // Simulate SMS sending (for development/testing)
  private async simulateSMSSend(phone: string, message: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📱 SMS sent to ${phone}: ${message}`);
  }
}

// Create and export SMS service instance
export const smsService = new SMSService();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  smsService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

export default SMSService;