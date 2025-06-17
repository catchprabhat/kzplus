import { Service } from '../types';

export const services: Service[] = [
  // Cleaning Services
  {
    id: 'wash-basic',
    name: 'Basic Car Wash',
    description: 'Exterior wash with soap and water, interior vacuum cleaning',
    price: 25,
    duration: '1 hour',
    category: 'cleaning',
    icon: 'droplets'
  },
  {
    id: 'wash-premium',
    name: 'Premium Car Wash',
    description: 'Complete exterior and interior cleaning with wax application',
    price: 45,
    duration: '2 hours',
    category: 'cleaning',
    icon: 'sparkles'
  },
  {
    id: 'ceramic-coating',
    name: 'Ceramic Coating',
    description: 'Professional ceramic coating for long-lasting paint protection',
    price: 299,
    duration: '1 day',
    category: 'enhancement',
    icon: 'shield'
  },
  {
    id: 'polishing',
    name: 'Car Polishing',
    description: 'Professional polishing to restore paint shine and remove scratches',
    price: 89,
    duration: '3 hours',
    category: 'enhancement',
    icon: 'star'
  },
  {
    id: 'ac-cleaning',
    name: 'AC Vent Cleaning',
    description: 'Deep cleaning of AC vents and air filter replacement',
    price: 35,
    duration: '45 minutes',
    category: 'maintenance',
    icon: 'wind'
  },
  {
    id: 'interior-detailing',
    name: 'Interior Detailing',
    description: 'Complete interior cleaning including seats, dashboard, and carpets',
    price: 65,
    duration: '2 hours',
    category: 'cleaning',
    icon: 'home'
  },
  
  // Maintenance Services
  {
    id: 'oil-change',
    name: 'Oil Change',
    description: 'Engine oil and filter replacement with quality check',
    price: 55,
    duration: '30 minutes',
    category: 'maintenance',
    icon: 'droplet'
  },
  {
    id: 'brake-service',
    name: 'Brake Service',
    description: 'Brake pad inspection and replacement if needed',
    price: 120,
    duration: '2 hours',
    category: 'maintenance',
    icon: 'disc'
  },
  {
    id: 'tire-service',
    name: 'Tire Service',
    description: 'Tire rotation, balancing, and pressure check',
    price: 40,
    duration: '1 hour',
    category: 'maintenance',
    icon: 'circle'
  },
  
  // Repair Services
  {
    id: 'engine-diagnostic',
    name: 'Engine Diagnostic',
    description: 'Complete engine diagnostic scan and report',
    price: 75,
    duration: '1 hour',
    category: 'repair',
    icon: 'search'
  },
  {
    id: 'battery-service',
    name: 'Battery Service',
    description: 'Battery testing and replacement if required',
    price: 95,
    duration: '45 minutes',
    category: 'repair',
    icon: 'battery'
  },
  {
    id: 'mechanic-inspection',
    name: 'General Mechanic Inspection',
    description: 'Comprehensive vehicle inspection by certified mechanic',
    price: 85,
    duration: '1.5 hours',
    category: 'repair',
    icon: 'wrench'
  }
];