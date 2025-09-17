import { Resend } from 'resend';

class EmailService {
  private resend: Resend;
  private otpStorage: Map<
    string,
    { email: string; otp: string; expiresAt: Date; attempts: number; isVerified: boolean }
  > = new Map();

  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor() {
    // Initialize Resend with API key from environment variables
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  // Generate a random OTP with configurable length
  private generateOTP(): string {
    let otp = '';
    const digits = '0123456789';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  // Generate email template for OTP
  private generateOTPEmailTemplate(
    otp: string
  ): { subject: string; html: string; text: string } {
    const subject = '🔐 Your A+ Auto Care Login Code';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>A+ Auto Care Login Code</title>
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
          <h1>🚗 A+ Auto Care</h1>
          <h2>Login Verification Code</h2>
          <p>Secure access to your account</p>
        </div>
        
        <div class="content">
          <div class="otp-container">
            <h3 style="margin-top: 0; color: #1f2937;">Your Login Code</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">
              Enter this code to complete your login to A+ Auto Care
            </p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              This code will expire in <strong>${this.OTP_EXPIRY_MINUTES} minutes</strong>
            </p>
          </div>
          
          <div class="warning">
            <h4 style="margin-top: 0; color: #92400e;">🔒 Security Notice</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>A+ Auto Care will never ask for this code via phone or email</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div class="security-tips">
            <h4 style="margin-top: 0; color: #1e40af;">💡 Security Tips</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Always log in from the official A+ Auto Care website</li>
              <li>Use a strong, unique password for your account</li>
              <li>Log out from shared or public devices</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>A+ Auto Care - Your Car Service Partner</strong></p>
          <p>📞 Support | 📧 support@aplusautocare.com</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated security message. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
A+ Auto Care - Login Verification Code

Your login code: ${otp}

This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.

Security Notice:
- Never share this code with anyone
- A+ Auto Care will never ask for this code via phone or email
- If you didn't request this code, please ignore this email

This is an automated security message.
    `;

    return { subject, html, text };
  }

  // Send OTP via email
  async sendOTP(
    email: string
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
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
        isVerified: false,
      });

      // Generate email template
      const template = this.generateOTPEmailTemplate(otp);

      // Always log OTP in development mode for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `📧 [DEV] OTP sent to ${email}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`
        );
      }
      
      try {
        // Send email using Resend
        const data = await this.resend.emails.send({
          from: 'A+ Auto Care <support@kzplusautocare.in>', // Use your verified domain
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
        console.log('Email sent successfully:', data);
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // Continue execution even if email sending fails
        // The OTP is still logged to the console in development mode
      }

      return {
        success: true,
        message: `Verification code sent to ${email}`,
        expiresIn: this.OTP_EXPIRY_MINUTES * 60, // in seconds
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.',
      };
    }
  }

  // Verify OTP
  async verifyOTP(
    email: string,
    inputOTP: string
  ): Promise<{ success: boolean; message: string }> {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return {
        success: false,
        message: 'No verification code found. Please request a new code.',
      };
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStorage.delete(email);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
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
        message: 'Verification successful! You can now access your account.',
      };
    } else {
      const remainingAttempts = this.MAX_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt${
          remainingAttempts !== 1 ? 's' : ''
        } remaining.`,
      };
    }
  }

  // Check if OTP is verified (for login completion)
  isOTPVerified(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    return otpData?.isVerified === true && new Date() <= otpData.expiresAt;
  }

  // Resend OTP (with rate limiting)
  async resendOTP(
    email: string
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    const otpData = this.otpStorage.get(email);

    if (otpData) {
      // Check if enough time has passed since last send (prevent spam)
      const timeSinceLastSend =
        Date.now() - (otpData.expiresAt.getTime() - this.OTP_EXPIRY_MINUTES * 60 * 1000);
      const minResendInterval = 60 * 1000; // 1 minute

      if (timeSinceLastSend < minResendInterval) {
        const waitTime = Math.ceil((minResendInterval - timeSinceLastSend) / 1000);
        return {
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new code.`,
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

  // Send booking confirmation email to both user and admin
  async sendBookingConfirmation(bookingDetails: {
    userEmail: string;
    userName: string;
    userPhone: string;
    carName: string;
    pickupDate: string;
    dropDate: string;
    totalPrice: number;
    pickupLocation: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const {
        userEmail,
        userName,
        userPhone,
        carName,
        pickupDate,
        dropDate,
        totalPrice,
        pickupLocation
      } = bookingDetails;

      // Format dates for better readability
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      const subject = '🚗🎉 Your Booking is Confirmed - A+ Auto Care';
      const adminSubject = '🚗📋 New Car Booking Received - A+ Auto Care';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - A+ Auto Care</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-card { background: white; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #1f2937; }
            .total-price { background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
            .contact-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚗 JIXDRIVE</h1>
            <h2>Your Booking is Confirmed! 🎉</h2>
            <p>Thank you for choosing JIXDRIVE</p>
          </div>
          
          <div class="content">
            <div class="booking-card">
              <h3 style="margin-top: 0; color: #1f2937; text-align: center;">Booking Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">👤 Full Name:</span>
                <span class="detail-value">${userName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📧 Email Address:</span>
                <span class="detail-value">${userEmail}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📱 Phone Number:</span>
                <span class="detail-value">${userPhone}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">🚗 Car Name:</span>
                <span class="detail-value">${carName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📍 Pickup Location:</span>
                <span class="detail-value">${pickupLocation}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">📅 Pickup Date & Time:</span>
                <span class="detail-value">${formatDate(pickupDate)}</span>
              </div>
              
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">📅 Drop Date & Time:</span>
                <span class="detail-value">${formatDate(dropDate)}</span>
              </div>
            </div>
            
            <div class="total-price">
              <h3 style="margin: 0; color: #059669;">💰 Total Price: ₹${totalPrice}</h3>
            </div>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #1e40af;">📞 Need Help?</h4>
              <p style="margin: 5px 0;">📧 Email: support@aplusautocare.com</p>
              <p style="margin: 5px 0;">📱 Phone: +91-XXXXXXXXXX</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Our team is here to assist you 24/7</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>JIXDRIVE - Your Trusted Car Rental Partner</strong></p>
            <p style="font-size: 12px; color: #9ca3af;">
              This is an automated confirmation email. Please save this for your records.
            </p>
          </div>
        </body>
        </html>
      `;

      // Admin email template with different header
      const adminHtml = html.replace(
        '<h2>Your Booking is Confirmed! 🎉</h2>',
        '<h2>New Car Booking Received! 📋</h2>'
      ).replace(
        '<p>Thank you for choosing JIXDRIVE</p>',
        '<p>A new booking has been made</p>'
      );

      const text = `
JIXDRIVE - Booking Confirmation

Your Booking is Confirmed! 🚗🎉

Booking Details:
- Full Name: ${userName}
- Email: ${userEmail}
- Phone: ${userPhone}
- Car: ${carName}
- Pickup Location: ${pickupLocation}
- Pickup: ${formatDate(pickupDate)}
- Drop: ${formatDate(dropDate)}
- Total Price: ₹${totalPrice}

Thank you for choosing JIXDRIVE!

Need help? Contact us at support@aplusautocare.com
      `;

      const adminText = text.replace(
        'Your Booking is Confirmed! 🚗🎉',
        'New Car Booking Received! 📋🚗'
      ).replace(
        'Thank you for choosing JIXDRIVE!',
        'Please review this booking in your admin dashboard.'
      );

      // Send email to user
      const userEmailResult = await this.resend.emails.send({
        from: 'JIXDRIVE <support@kzplusautocare.in>',
        to: userEmail,
        subject: subject,
        html: html,
        text: text,
      });

      console.log('User confirmation email sent successfully:', userEmailResult);

      // Send email to admin
      const adminEmailResult = await this.resend.emails.send({
        from: 'JIXDRIVE <support@kzplusautocare.in>',
        to: process.env.ADMIN_EMAIL || 'umrsjd123@gmail.com',
        subject: adminSubject,
        html: adminHtml,
        text: adminText,
      });

      console.log('Admin notification email sent successfully:', adminEmailResult);
      
      return {
        success: true,
        message: 'Booking confirmation emails sent successfully to user and admin'
      };
    } catch (error) {
      console.error('Failed to send booking confirmation emails:', error);
      return {
        success: false,
        message: 'Failed to send booking confirmation emails'
      };
    }
  }
}

// Create and export email service instance
export const emailService = new EmailService();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  emailService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

export default EmailService;
