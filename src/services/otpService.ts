// Email OTP Service for authentication
export interface OTPData {
  email: string;
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

class OTPService {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate email template for OTP
  private generateOTPEmailTemplate(otp: string, email: string): { subject: string; html: string; text: string } {
    const subject = '🔐 Your DriveEasy Login Code';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DriveEasy Login Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-container { background: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .otp-code { font-size: 36px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; margin: 20px 0; padding: 20px; background: #eff6ff; border-radius: 8px; border: 2px dashed #3b82f6; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
          .security-tips { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚗 DriveEasy</h1>
          <h2>Login Verification Code</h2>
          <p>Secure access to your account</p>
        </div>
        
        <div class="content">
          <div class="otp-container">
            <h3 style="margin-top: 0; color: #1f2937;">Your Login Code</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">
              Enter this code to complete your login to DriveEasy
            </p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              This code will expire in <strong>10 minutes</strong>
            </p>
          </div>
          
          <div class="warning">
            <h4 style="margin-top: 0; color: #92400e;">🔒 Security Notice</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>DriveEasy will never ask for this code via phone or email</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div class="security-tips">
            <h4 style="margin-top: 0; color: #1e40af;">💡 Security Tips</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Always log in from the official DriveEasy website</li>
              <li>Use a strong, unique password for your account</li>
              <li>Log out from shared or public devices</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>DriveEasy - Secure Car Solutions</strong></p>
          <p>📞 1-800-DRIVE-EASY | 📧 support@driveeasy.com</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated security message. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
🚗 DriveEasy - Login Verification Code

Your login code: ${otp}

This code will expire in 10 minutes.

Security Notice:
- Never share this code with anyone
- DriveEasy will never ask for this code via phone or email
- If you didn't request this code, please ignore this email

For support: 1-800-DRIVE-EASY
Email: support@driveeasy.com

This is an automated security message.
    `;

    return { subject, html, text };
  }

  // Send OTP via email
  async sendOTP(email: string): Promise<OTPResponse> {
    try {
      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP data
      this.otpStorage.set(email, {
        email,
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false
      });

      // Generate email template
      const template = this.generateOTPEmailTemplate(otp, email);

      // Simulate email sending (replace with actual email service)
      await this.simulateEmailSend({
        to: email,
        from: 'noreply@driveeasy.com',
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log(`📧 OTP sent to ${email}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);

      return {
        success: true,
        message: `Verification code sent to ${email}`,
        expiresIn: this.OTP_EXPIRY_MINUTES * 60 // in seconds
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(email: string, inputOTP: string): Promise<OTPResponse> {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return {
        success: false,
        message: 'No verification code found. Please request a new code.'
      };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(email);
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
        this.otpStorage.delete(email);
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
  isOTPVerified(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    return otpData?.isVerified === true && new Date() <= otpData.expiresAt;
  }

  // Resend OTP (with rate limiting)
  async resendOTP(email: string): Promise<OTPResponse> {
    const otpData = this.otpStorage.get(email);
    
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

    return this.sendOTP(email);
  }

  // Clean up expired OTPs (call periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(email);
      }
    }
  }

  // Get OTP status for debugging/admin purposes
  getOTPStatus(email: string): { exists: boolean; expiresAt?: Date; attempts?: number; isVerified?: boolean } {
    const otpData = this.otpStorage.get(email);
    if (!otpData) {
      return { exists: false };
    }

    return {
      exists: true,
      expiresAt: otpData.expiresAt,
      attempts: otpData.attempts,
      isVerified: otpData.isVerified
    };
  }

  // Simulate email sending (replace with actual email service)
  private async simulateEmailSend(emailData: any): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, replace with actual email service:
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
    
    // Example with AWS SES:
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: 'us-east-1' });
    // await ses.sendEmail({
    //   Source: emailData.from,
    //   Destination: { ToAddresses: [emailData.to] },
    //   Message: {
    //     Subject: { Data: emailData.subject },
    //     Body: {
    //       Html: { Data: emailData.html },
    //       Text: { Data: emailData.text }
    //     }
    //   }
    // }).promise();
    
    console.log('✅ OTP email sent successfully (simulated)');
  }
}

// Create and export OTP service instance
export const otpService = new OTPService();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  otpService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

export default OTPService;