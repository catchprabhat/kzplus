import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Navigation, Car } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        serviceType: 'general'
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // DriveEasy office location (using a sample location - replace with actual coordinates)
  const officeLocation = {
    lat: 40.7128,
    lng: -74.0060,
    address: "123 Business District, New York, NY 10001"
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      primary: "1-800-DRIVE-EASY",
      secondary: "(1-800-374-8332)",
      description: "24/7 Customer Support",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "Email Support",
      primary: "support@driveeasy.com",
      secondary: "info@driveeasy.com",
      description: "Response within 2 hours",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      primary: "+1 (555) 123-4567",
      secondary: "Business Hours",
      description: "Quick responses via WhatsApp",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: MapPin,
      title: "Office Location",
      primary: "123 Business District",
      secondary: "New York, NY 10001",
      description: "Visit our main office",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const businessHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
    { day: "Emergency Support", hours: "24/7 Available" }
  ];

  const serviceTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Car Rental Booking' },
    { value: 'service', label: 'Car Service Support' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're here to help! Reach out to us for any questions about our car rental services, 
          maintenance support, or general inquiries. Our team is ready to assist you 24/7.
        </p>
      </div>

      {/* Contact Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((info, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 ${info.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              <info.icon className={`w-6 h-6 ${info.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-gray-900 font-medium">{info.primary}</p>
            <p className="text-gray-600 text-sm">{info.secondary}</p>
            <p className="text-gray-500 text-xs mt-2">{info.description}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Send className="w-6 h-6 mr-3 text-blue-600" />
              Send us a Message
            </h2>
            <p className="text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600">
                Thank you for contacting us. We'll respond within 2 hours during business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={loading}
                  >
                    {serviceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Brief description of your inquiry"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Please provide details about your inquiry..."
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Map and Business Hours */}
        <div className="space-y-8">
          {/* Google Maps */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                Our Location
              </h2>
              <p className="text-gray-600">Visit our main office for in-person assistance</p>
            </div>
            
            {/* Google Maps Embed */}
            <div className="relative h-64 bg-gray-100">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878459418!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1635959729807!5m2!1sen!2sus`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DriveEasy Office Location"
                className="absolute inset-0"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{officeLocation.address}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Easily accessible by public transport and car
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Car className="w-4 h-4 mr-2" />
                  Parking Info
                </button>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-blue-600" />
              Business Hours
            </h2>
            
            <div className="space-y-4">
              {businessHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-900">{schedule.day}</span>
                  <span className={`text-sm ${
                    schedule.day === 'Emergency Support' 
                      ? 'text-green-600 font-semibold' 
                      : 'text-gray-600'
                  }`}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-800 font-medium">Currently Open</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Our support team is available to assist you right now!
              </p>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
            <div className="space-y-3">
              <a 
                href="tel:1-800-374-8332" 
                className="flex items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Phone className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Call Now</p>
                  <p className="text-sm opacity-90">1-800-DRIVE-EASY</p>
                </div>
              </a>
              
              <a 
                href="mailto:support@driveeasy.com" 
                className="flex items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm opacity-90">support@driveeasy.com</p>
                </div>
              </a>
              
              <a 
                href="https://wa.me/15551234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm opacity-90">Quick responses</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I make a car rental booking?</h3>
              <p className="text-gray-600 text-sm">
                You can book a car through our website, mobile app, or by calling our support team. 
                Choose your dates, select a vehicle, and complete the booking process.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What documents do I need for car rental?</h3>
              <p className="text-gray-600 text-sm">
                You'll need a valid driver's license, credit card, and government-issued ID. 
                International customers may need an International Driving Permit.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I modify or cancel my booking?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can modify or cancel your booking through your account dashboard or 
                by contacting our support team. Cancellation policies may apply.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What car services do you offer?</h3>
              <p className="text-gray-600 text-sm">
                We offer comprehensive car services including washing, detailing, maintenance, 
                repairs, and ceramic coating. All services are performed by certified professionals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you provide 24/7 roadside assistance?</h3>
              <p className="text-gray-600 text-sm">
                Yes, all our rental vehicles come with 24/7 roadside assistance including 
                emergency towing, battery jump-start, and flat tire assistance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I contact customer support?</h3>
              <p className="text-gray-600 text-sm">
                You can reach us via phone, email, WhatsApp, or through this contact form. 
                Our support team is available 24/7 for emergencies and during business hours for general inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};