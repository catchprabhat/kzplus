import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob' // For installed applications
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async createBookingEvent(bookingDetails: {
    userName: string;
    userEmail: string;
    userPhone: string;
    carName: string;
    pickupDate: string;
    dropDate: string;
    pickupLocation: string;
    totalPrice: number;
  }): Promise<{ success: boolean; message: string; eventId?: string }> {
    try {
      const {
        userName,
        userEmail,
        userPhone,
        carName,
        pickupDate,
        dropDate,
        pickupLocation,
        totalPrice
      } = bookingDetails;

      // Format dates for Google Calendar
      const startDate = new Date(pickupDate);
      const endDate = new Date(dropDate);

      const event = {
        summary: `🚗 Car Booking - ${carName}`,
        description: `Car Rental Booking Details:\n\n` +
                    `👤 Customer: ${userName}\n` +
                    `📧 Email: ${userEmail}\n` +
                    `📱 Phone: ${userPhone}\n` +
                    `🚗 Car: ${carName}\n` +
                    `📍 Pickup Location: ${pickupLocation}\n` +
                    `💰 Total Price: ₹${totalPrice}\n\n` +
                    `Booking managed by A+ Auto Care`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        location: pickupLocation,
        attendees: [
          { email: userEmail },
          { email: process.env.ADMIN_EMAIL }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        colorId: '2', // Green color for car bookings
      };

      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      console.log('Google Calendar event created:', response.data.id);
      
      return {
        success: true,
        message: 'Calendar event created successfully',
        eventId: response.data.id
      };
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return {
        success: false,
        message: 'Failed to create calendar event'
      };
    }
  }

  async updateBookingEvent(
    eventId: string,
    bookingDetails: {
      userName: string;
      userEmail: string;
      userPhone: string;
      carName: string;
      pickupDate: string;
      dropDate: string;
      pickupLocation: string;
      totalPrice: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const {
        userName,
        userEmail,
        userPhone,
        carName,
        pickupDate,
        dropDate,
        pickupLocation,
        totalPrice
      } = bookingDetails;

      const startDate = new Date(pickupDate);
      const endDate = new Date(dropDate);

      const event = {
        summary: `🚗 Car Booking - ${carName}`,
        description: `Car Rental Booking Details:\n\n` +
                    `👤 Customer: ${userName}\n` +
                    `📧 Email: ${userEmail}\n` +
                    `📱 Phone: ${userPhone}\n` +
                    `🚗 Car: ${carName}\n` +
                    `📍 Pickup Location: ${pickupLocation}\n` +
                    `💰 Total Price: ₹${totalPrice}\n\n` +
                    `Booking managed by A+ Auto Care`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        location: pickupLocation,
      };

      await this.calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      return {
        success: true,
        message: 'Calendar event updated successfully'
      };
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      return {
        success: false,
        message: 'Failed to update calendar event'
      };
    }
  }

  async deleteBookingEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      return {
        success: true,
        message: 'Calendar event deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      return {
        success: false,
        message: 'Failed to delete calendar event'
      };
    }
  }
}

// Create and export Google Calendar service instance
export const googleCalendarService = new GoogleCalendarService();
export default GoogleCalendarService;