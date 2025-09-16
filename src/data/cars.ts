import { Car } from '../types';
import safariKA from '../images/safari-KA.jpeg';
import dusterKA from '../images/duster-KA.jpg';
import baleno from '../images/balenoo.jpg';
import Poloo from '../images/polo.jpg';
import Glanzaa from '../images/GL_1.jpg';
import Crysta from '../images/Innova.jpg';

export const cars: Car[] = [
  {
    id: '1',
    name: 'Innova Crysta',
    image: Crysta,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 6000,
    pricePerHour: 250,
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
    pricePerHour: 280,
    features: ['AWD', 'Panoramic Roof', 'Premium Sound', '18 Inch Tyres'],
    available: true
  },
  {
    id: '3',
    name: 'Duster',
    image: dusterKA,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true
  },
  {
    id: '4',
    name: 'Baleno',
    image: baleno,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true
  },
  {
    id: '5',
    name: 'Polo',
    image: Poloo,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Diesel',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true
  },
  {
    id: '6',
    name: 'Glanza',
    image: Glanzaa,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true
  },
];