// Top-level module (imports and cars array)
import { Car } from '../types';
import safariKA from '../images/safari-KA.jpeg';
import dusterKA from '../images/duster-KA.jpg';
import duster1 from '../images/duster1.jpg';
import baleno from '../images/balenoo.jpg';
import balenoAuto from '../images/balenoAuto.png';
import Poloo from '../images/polo.jpg';
import PoloNew from '../images/poloNew.png';
import ciaz from '../images/ciaz.jpg';
import blueCiaz from '../images/blueCiaz.jpg';
import Crysta from '../images/Innova.png';
import swift from '../images/swiftM.png';
import ertiga from '../images/ertigaNew.png';

export const cars: Car[] = [
  {
    id: '1',
    name: 'Tata Safari 2023',
    image: safariKA,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 7000,
    pricePerHour: 400,
    features: ['AWD', 'Panoramic Roof', 'Premium Sound', '18 Inch Tyres'],
    available: true,
    subscription: 3400
  },
  {
    id: '2',
    name: 'Innova Crysta',
    image: Crysta,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 6000,
    pricePerHour: 400,
    features: ['Captain-Seats', 'Premium Audio'],
    available: true,
    subscription: 3000
  },
  {
    id: '3',
    name: 'Ertiga',
    image: ertiga,
    type: 'SUV',
    seats: 7,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 4000,
    pricePerHour: 350,
    features: ['Captain-Seats', 'Premium Audio'],
    available: true,
    subscription: 2500
  },
  
  {
    id: '4',
    name: 'Duster',
    image: dusterKA,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '5',
    name: 'Duster',
    image: duster1,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '6',
    name: 'Baleno',
    image: baleno,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '7',
    name: 'Polo',
    image: Poloo,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Diesel',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1000
  },
  {
    id: '8',
    name: 'Maruti Ciaz',
    image: ciaz,
    type: 'Sedan',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '9',
    name: 'Swift',
    image: swift,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '10',
    name: 'Baleno 2026',
    image: PoloNew,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 200,
    features: ['Brand-new', 'Premium Audio'],
    available: true,
    subscription: 1500
  },
  {
    id: '11',
    name: 'Blue Ciaz',
    image: blueCiaz,
    type: 'Sedan',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    subscription: 1800
  },
  {
    id: '12',
    name: 'Baleno Automatic',
    image: balenoAuto,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 200,
    features: ['Brand-new', 'Premium Audio'],
    available: true,
    subscription: 1500
  }
];
