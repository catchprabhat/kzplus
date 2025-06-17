import React, { useState } from 'react';
import { Mail, MessageCircle, Settings, Bell, Check, X } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    whatsappEnabled: true,
    emailApiKey: '',
    whatsappApiKey: '',
    whatsappBusinessNumber: '',
    testMode: true
  });

  const [testResults, setTestResults] = useState<{
    email?: 'success' | 'error';
    whatsapp?: 'success' | 'error';
  }>({});

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Update notification service configuration
    notificationService.updateConfig({
      emailEnabled: settings.emailEnabled,
      whatsappEnabled: settings.whatsappEnabled,
      emailApiKey: settings.emailApiKey || 'demo-key',
      whatsappApiKey: settings.whatsappApiKey || 'demo-key',
      whatsappBusinessNumber: settings.whatsappBusinessNumber || '+1234567890'
    });

    console.log('Notification settings updated:', settings);
    if (onClose) onClose();
  };

  const testEmailNotification = async () => {
    setLoading(true);
    try {
      // Create a test booking for email notification
      const testBooking = {
        id: 'test-' + Date.now(),
        carId: '1',
        carName: 'Tesla Model 3',
        carType: 'Electric',
        carSeats: 5,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        dropDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalDays: 3,
        totalPrice: 267,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1-555-0123',
        status: 'confirmed' as const,
        createdAt: new Date()
      };

      await notificationService.sendBookingConfirmation(testBooking);
      setTestResults(prev => ({ ...prev, email: 'success' }));
    } catch (error) {
      console.error('Email test failed:', error);
      setTestResults(prev => ({ ...prev, email: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppNotification = async () => {
    setLoading(true);
    try {
      // Create a test service booking for WhatsApp notification
      const testServiceBooking = {
        id: 'test-service-' + Date.now(),
        vehicleNumber: 'TEST123',
        vehicleName: 'Honda Civic',
        vehicleType: 'Sedan',
        customerName: 'Test Customer',
        customerPhone: '+1-555-0123',
        customerEmail: 'test@example.com',
        services: [
          {
            id: 'wash-basic',
            name: 'Basic Car Wash',
            description: 'Exterior wash with soap and water',
            price: 25,
            duration: '1 hour',
            category: 'cleaning' as const,
            icon: 'droplets'
          }
        ],
        totalPrice: 25,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduledTime: '10:00',
        status: 'pending' as const,
        createdAt: new Date()
      };

      await notificationService.sendServiceBookingConfirmation(testServiceBooking);
      setTestResults(prev => ({ ...prev, whatsapp: 'success' }));
    } catch (error) {
      console.error('WhatsApp test failed:', error);
      setTestResults(prev => ({ ...prev, whatsapp: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Notification Settings
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Email Settings */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Email Notifications</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.emailEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email API Key (SendGrid, AWS SES, etc.)
                </label>
                <input
                  type="password"
                  value={settings.emailApiKey}
                  onChange={(e) => handleSettingChange('emailApiKey', e.target.value)}
                  placeholder="Enter your email service API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={testEmailNotification}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email
                </button>
                {testResults.email === 'success' && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">Email sent successfully!</span>
                  </div>
                )}
                {testResults.email === 'error' && (
                  <div className="flex items-center text-red-600">
                    <X className="w-4 h-4 mr-1" />
                    <span className="text-sm">Email test failed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Settings */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-gray-900">WhatsApp Notifications</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={(e) => handleSettingChange('whatsappEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {settings.whatsappEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Business API Key
                </label>
                <input
                  type="password"
                  value={settings.whatsappApiKey}
                  onChange={(e) => handleSettingChange('whatsappApiKey', e.target.value)}
                  placeholder="Enter your WhatsApp Business API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Business Number
                </label>
                <input
                  type="text"
                  value={settings.whatsappBusinessNumber}
                  onChange={(e) => handleSettingChange('whatsappBusinessNumber', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={testWhatsAppNotification}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Test WhatsApp
                </button>
                {testResults.whatsapp === 'success' && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">WhatsApp sent successfully!</span>
                  </div>
                )}
                {testResults.whatsapp === 'error' && (
                  <div className="flex items-center text-red-600">
                    <X className="w-4 h-4 mr-1" />
                    <span className="text-sm">WhatsApp test failed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Mode */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <h4 className="font-semibold text-gray-900">Test Mode</h4>
                <p className="text-sm text-gray-600">
                  In test mode, notifications are logged to console instead of being sent
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.testMode}
                onChange={(e) => handleSettingChange('testMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Integration Guide</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Email Services:</strong> Replace the mock email function with your preferred service:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>SendGrid: Use @sendgrid/mail package</li>
              <li>AWS SES: Use AWS SDK</li>
              <li>Nodemailer: For SMTP services</li>
            </ul>
            <p><strong>WhatsApp:</strong> Integrate with WhatsApp Business API:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Twilio WhatsApp API</li>
              <li>Facebook WhatsApp Business API</li>
              <li>Other WhatsApp Business providers</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};