import { Car } from '../types';

export const cars: Car[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    image: 'https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Electric',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric',
    pricePerDay: 89,
    features: ['Autopilot', 'Premium Audio', 'Heated Seats', 'Fast Charging'],
    available: true
  },
  {
    id: '2',
    name: 'BMW X5',
    image: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 95,
    features: ['4WD', 'Panoramic Roof', 'Premium Sound', 'Navigation'],
    available: true
  },
  {
    id: '3',
    name: 'Audi A4',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 75,
    features: ['Quattro AWD', 'Virtual Cockpit', 'Leather Seats', 'Climate Control'],
    available: true
  },
  {
    id: '4',
    name: 'Mercedes C-Class',
    image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Luxury',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 85,
    features: ['AMG Package', 'Premium Interior', 'Advanced Safety', 'Ambient Lighting'],
    available: true
  },
  {
    id: '5',
    name: 'Range Rover Evoque',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 110,
    features: ['Terrain Response', 'Meridian Audio', 'Panoramic Roof', '4WD'],
    available: true
  },
  {
    id: '6',
    name: 'Porsche 911',
    image: 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'Sports',
    seats: 2,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 150,
    features: ['Sport Package', 'Racing Seats', 'Premium Sound', 'Track Mode'],
    available: true
  }
];