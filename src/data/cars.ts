import { Car } from '../types';
import  greycrystaUP  from '../images/greycrysta-UP.png';
import safariKA from '../images/safari-KA.png';
import dusterKA from '../images/duster-KA.png';

export const cars: Car[] = [
  {
    id: '1',
    name: 'Innova Crysta',
    image: greycrystaUP,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 6000,
    features: ['Captain-Seats', 'Premium Audio'],
    available: true
  },
  {
    id: '2',
    name: 'Tata Safari 2023',
    image: safariKA,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 7000,
    features: ['AWD', 'Panoramic Roof', 'Premium Sound', '18 Inch Tyres'],
    available: true
  },
  {
    id: '3',
    name: 'Duster 2023',
    image: dusterKA,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    features: ['Auto Climate Control'],
    available: true
  }
];