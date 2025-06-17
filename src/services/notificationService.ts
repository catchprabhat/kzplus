// Notification service for email and WhatsApp notifications
import { Booking, ServiceBooking } from '../types';

export interface NotificationConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  emailApiKey?: string;
  whatsappApiKey?: string;
  whatsappBusinessNumber?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
}

class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  // Send booking confirmation notifications
  async sendBookingConfirmation(booking: Booking): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (this.config.emailEnabled) {
        promises.push(this.sendBookingEmail(booking));
      }

      if (this.config.whatsappEnabled) {
        promises.push(this.sendBookingWhatsApp(booking));
      }

      await Promise.all(promises);
      console.log('Booking notifications sent successfully');
    } catch (error) {
      console.error('Failed to send booking notifications:', error);
      throw error;
    }
  }

  // Send service booking confirmation notifications
  async sendServiceBookingConfirmation(serviceBooking: ServiceBooking): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (this.config.emailEnabled) {
        promises.push(this.sendServiceBookingEmail(serviceBooking));
      }

      if (this.config.whatsappEnabled) {
        promises.push(this.sendServiceBookingWhatsApp(serviceBooking));
      }

      await Promise.all(promises);
      console.log('Service booking notifications sent successfully');
    } catch (error) {
      console.error('Failed to send service booking notifications:', error);
      throw error;
    }
  }

  // Generate email template for car rental booking
  private generateBookingEmailTemplate(booking: Booking): EmailTemplate {
    const pickupDate = booking.pickupDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const pickupTime = booking.pickupDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const dropDate = booking.dropDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const dropTime = booking.dropDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const subject = `🚗 Car Rental Booking Confirmed - ${booking.carName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .total-row { background: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 15px; }
          .total-amount { font-size: 24px; font-weight: bold; color: #1d4ed8; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚗 DriveEasy</h1>
          <h2>Booking Confirmation</h2>
          <p>Your car rental has been confirmed!</p>
        </div>
        
        <div class="content">
          <div class="booking-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="margin: 0; color: #1f2937;">Booking Details</h3>
              <span class="status-badge">CONFIRMED</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${booking.id}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Vehicle:</span>
              <span class="detail-value">${booking.carName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${booking.carType} (${booking.carSeats} seats)</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${booking.customerName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${booking.customerPhone}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${booking.customerEmail}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Pickup:</span>
              <span class="detail-value">${pickupDate} at ${pickupTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Drop-off:</span>
              <span class="detail-value">${dropDate} at ${dropTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${booking.totalDays} day${booking.totalDays !== 1 ? 's' : ''}</span>
            </div>
            
            <div class="total-row">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
                <span class="total-amount">$${booking.totalPrice}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="button">View Booking Details</a>
            <a href="#" class="button" style="background: #10b981;">Contact Support</a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="margin-top: 0; color: #92400e;">Important Reminders:</h4>
            <ul style="color: #92400e; margin: 0;">
              <li>Please bring a valid driver's license and credit card</li>
              <li>Arrive 15 minutes before your pickup time</li>
              <li>Vehicle inspection will be done before handover</li>
              <li>Contact us immediately for any changes or cancellations</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>DriveEasy Car Rentals</strong></p>
          <p>📞 1-800-DRIVE-EASY | 📧 support@driveeasy.com</p>
          <p>Available 24/7 for your convenience</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
🚗 DriveEasy - Booking Confirmation

Dear ${booking.customerName},

Your car rental booking has been confirmed!

Booking Details:
- Booking ID: #${booking.id}
- Vehicle: ${booking.carName} (${booking.carType}, ${booking.carSeats} seats)
- Pickup: ${pickupDate} at ${pickupTime}
- Drop-off: ${dropDate} at ${dropTime}
- Duration: ${booking.totalDays} day${booking.totalDays !== 1 ? 's' : ''}
- Total Amount: $${booking.totalPrice}

Important Reminders:
- Please bring a valid driver's license and credit card
- Arrive 15 minutes before your pickup time
- Vehicle inspection will be done before handover
- Contact us immediately for any changes or cancellations

Contact Information:
Phone: 1-800-DRIVE-EASY
Email: support@driveeasy.com
Available 24/7

Thank you for choosing DriveEasy!
    `;

    return { subject, html, text };
  }

  // Generate email template for service booking
  private generateServiceBookingEmailTemplate(serviceBooking: ServiceBooking): EmailTemplate {
    const serviceDate = serviceBooking.scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const serviceTime = new Date(`2000-01-01T${serviceBooking.scheduledTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const subject = `🔧 Car Service Booking Confirmed - ${serviceBooking.vehicleNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .service-item { background: #f0f9ff; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #3b82f6; }
          .total-row { background: #ecfdf5; padding: 15px; border-radius: 6px; margin-top: 15px; }
          .total-amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .status-badge { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 DriveEasy Services</h1>
          <h2>Service Booking Confirmation</h2>
          <p>Your car service has been scheduled!</p>
        </div>
        
        <div class="content">
          <div class="booking-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="margin: 0; color: #1f2937;">Service Booking Details</h3>
              <span class="status-badge">SCHEDULED</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#${serviceBooking.id}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Vehicle:</span>
              <span class="detail-value">${serviceBooking.vehicleName} (${serviceBooking.vehicleNumber})</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${serviceBooking.customerName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${serviceBooking.customerPhone}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${serviceBooking.customerEmail}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Service Date:</span>
              <span class="detail-value">${serviceDate} at ${serviceTime}</span>
            </div>
            
            <div style="margin: 20px 0;">
              <h4 style="color: #1f2937; margin-bottom: 10px;">Selected Services:</h4>
              ${serviceBooking.services.map(service => `
                <div class="service-item">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${service.name}</strong>
                      <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">${service.description}</p>
                      <span style="font-size: 12px; color: #9ca3af;">Duration: ${service.duration}</span>
                    </div>
                    <span style="font-weight: bold; color: #059669;">$${service.price}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${serviceBooking.notes ? `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="margin-top: 0; color: #374151;">Additional Notes:</h4>
                <p style="margin-bottom: 0; color: #6b7280;">${serviceBooking.notes}</p>
              </div>
            ` : ''}
            
            <div class="total-row">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
                <span class="total-amount">$${serviceBooking.totalPrice}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="button">View Service Details</a>
            <a href="#" class="button" style="background: #3b82f6;">Reschedule Service</a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="margin-top: 0; color: #92400e;">Service Preparation:</h4>
            <ul style="color: #92400e; margin: 0;">
              <li>Please arrive 10 minutes before your scheduled time</li>
              <li>Remove all personal items from the vehicle</li>
              <li>Ensure the vehicle has sufficient fuel (if applicable)</li>
              <li>Bring your vehicle registration and any service history</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>DriveEasy Car Services</strong></p>
          <p>📞 1-800-DRIVE-EASY | 📧 support@driveeasy.com</p>
          <p>Professional car care services available 24/7</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
🔧 DriveEasy Services - Service Booking Confirmation

Dear ${serviceBooking.customerName},

Your car service booking has been confirmed!

Service Details:
- Booking ID: #${serviceBooking.id}
- Vehicle: ${serviceBooking.vehicleName} (${serviceBooking.vehicleNumber})
- Service Date: ${serviceDate} at ${serviceTime}

Selected Services:
${serviceBooking.services.map(service => `- ${service.name} ($${service.price}) - ${service.duration}`).join('\n')}

Total Amount: $${serviceBooking.totalPrice}

${serviceBooking.notes ? `Additional Notes: ${serviceBooking.notes}` : ''}

Service Preparation:
- Please arrive 10 minutes before your scheduled time
- Remove all personal items from the vehicle
- Ensure the vehicle has sufficient fuel (if applicable)
- Bring your vehicle registration and any service history

Contact Information:
Phone: 1-800-DRIVE-EASY
Email: support@driveeasy.com
Available 24/7

Thank you for choosing DriveEasy Services!
    `;

    return { subject, html, text };
  }

  // Send booking confirmation email
  private async sendBookingEmail(booking: Booking): Promise<void> {
    try {
      const template = this.generateBookingEmailTemplate(booking);
      
      // Replace with actual email service (SendGrid, AWS SES, etc.)
      const emailData = {
        to: booking.customerEmail,
        from: 'noreply@driveeasy.com',
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      // Simulate email sending
      console.log('Sending booking confirmation email:', emailData);
      await this.simulateEmailSend(emailData);
      
      console.log(`Booking confirmation email sent to ${booking.customerEmail}`);
    } catch (error) {
      console.error('Failed to send booking email:', error);
      throw error;
    }
  }

  // Send service booking confirmation email
  private async sendServiceBookingEmail(serviceBooking: ServiceBooking): Promise<void> {
    try {
      const template = this.generateServiceBookingEmailTemplate(serviceBooking);
      
      // Replace with actual email service
      const emailData = {
        to: serviceBooking.customerEmail,
        from: 'noreply@driveeasy.com',
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      // Simulate email sending
      console.log('Sending service booking confirmation email:', emailData);
      await this.simulateEmailSend(emailData);
      
      console.log(`Service booking confirmation email sent to ${serviceBooking.customerEmail}`);
    } catch (error) {
      console.error('Failed to send service booking email:', error);
      throw error;
    }
  }

  // Send booking confirmation WhatsApp message
  private async sendBookingWhatsApp(booking: Booking): Promise<void> {
    try {
      const pickupDate = booking.pickupDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const pickupTime = booking.pickupDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const message = `🚗 *DriveEasy - Booking Confirmed!*

Hi ${booking.customerName}! 👋

Your car rental booking has been confirmed:

📋 *Booking Details:*
• Booking ID: #${booking.id}
• Vehicle: ${booking.carName}
• Type: ${booking.carType} (${booking.carSeats} seats)
• Pickup: ${pickupDate} at ${pickupTime}
• Duration: ${booking.totalDays} day${booking.totalDays !== 1 ? 's' : ''}
• Total: $${booking.totalPrice}

⚠️ *Important Reminders:*
• Bring valid driver's license & credit card
• Arrive 15 minutes early
• Vehicle inspection before handover

📞 Need help? Call 1-800-DRIVE-EASY
Available 24/7!

Thank you for choosing DriveEasy! 🙏`;

      const whatsappData: WhatsAppMessage = {
        to: booking.customerPhone,
        message
      };

      // Simulate WhatsApp sending
      console.log('Sending booking WhatsApp message:', whatsappData);
      await this.simulateWhatsAppSend(whatsappData);
      
      console.log(`Booking confirmation WhatsApp sent to ${booking.customerPhone}`);
    } catch (error) {
      console.error('Failed to send booking WhatsApp:', error);
      throw error;
    }
  }

  // Send service booking confirmation WhatsApp message
  private async sendServiceBookingWhatsApp(serviceBooking: ServiceBooking): Promise<void> {
    try {
      const serviceDate = serviceBooking.scheduledDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const serviceTime = new Date(`2000-01-01T${serviceBooking.scheduledTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const servicesText = serviceBooking.services.map(s => `• ${s.name} ($${s.price})`).join('\n');

      const message = `🔧 *DriveEasy Services - Booking Confirmed!*

Hi ${serviceBooking.customerName}! 👋

Your car service has been scheduled:

📋 *Service Details:*
• Booking ID: #${serviceBooking.id}
• Vehicle: ${serviceBooking.vehicleName} (${serviceBooking.vehicleNumber})
• Date: ${serviceDate} at ${serviceTime}

🛠️ *Selected Services:*
${servicesText}

💰 *Total: $${serviceBooking.totalPrice}*

${serviceBooking.notes ? `📝 *Notes:* ${serviceBooking.notes}` : ''}

⚠️ *Preparation:*
• Arrive 10 minutes early
• Remove personal items
• Bring vehicle registration

📞 Need help? Call 1-800-DRIVE-EASY
Available 24/7!

Thank you for choosing DriveEasy Services! 🙏`;

      const whatsappData: WhatsAppMessage = {
        to: serviceBooking.customerPhone,
        message
      };

      // Simulate WhatsApp sending
      console.log('Sending service booking WhatsApp message:', whatsappData);
      await this.simulateWhatsAppSend(whatsappData);
      
      console.log(`Service booking confirmation WhatsApp sent to ${serviceBooking.customerPhone}`);
    } catch (error) {
      console.error('Failed to send service booking WhatsApp:', error);
      throw error;
    }
  }

  // Simulate email sending (replace with actual email service)
  private async simulateEmailSend(emailData: any): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace with actual email service:
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.config.emailApiKey);
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
    
    console.log('✅ Email sent successfully (simulated)');
  }

  // Simulate WhatsApp sending (replace with actual WhatsApp Business API)
  private async simulateWhatsAppSend(whatsappData: WhatsAppMessage): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In production, replace with actual WhatsApp Business API:
    // Example with Twilio WhatsApp API:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   from: `whatsapp:${this.config.whatsappBusinessNumber}`,
    //   to: `whatsapp:${whatsappData.to}`,
    //   body: whatsappData.message
    // });
    
    // Example with WhatsApp Business API:
    // const response = await fetch(`https://graph.facebook.com/v17.0/${this.config.whatsappBusinessNumber}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.whatsappApiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: whatsappData.to,
    //     type: 'text',
    //     text: { body: whatsappData.message }
    //   })
    // });
    
    console.log('✅ WhatsApp message sent successfully (simulated)');
  }

  // Update notification configuration
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export notification service instance
export const notificationService = new NotificationService({
  emailEnabled: true,
  whatsappEnabled: true,
  emailApiKey: 'demo-key',
  whatsappApiKey: 'demo-key',
  whatsappBusinessNumber: '+917735537655'
});

export default NotificationService;