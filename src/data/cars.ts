// Top-level module (imports and cars array)
import { Car } from '../types';
import safariKA from '../images/safari-KA.jpeg';
import dusterKA from '../images/duster-KA.jpg';
import duster1 from '../images/duster1.jpg';
import baleno from '../images/balenoo.jpg';
import balenoAuto from '../images/balenoAuto.png';
import Poloo from '../images/polo.jpg';
import PoloNew from '../images/poloNew.png';
import blackciaz from '../images/ciaz.jpg';
import blueCiaz from '../images/blueCiaz.jpg';
import Crysta from '../images/Innova.png';
import swift from '../images/swiftM.png';
import ertiga from '../images/ertigaNew.png';
import i20 from '../images/i20.png';

export const cars: Car[] = [
  {
    id: '1',
    name: 'Safari 23',
    image: safariKA,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 7000,
    pricePerHour: 400,
    features: ['AWD', 'Panoramic Roof', 'Premium Sound', '18 Inch Tyres'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 3400
  },
  {
    id: '2',
    name: 'DL Crysta',
    image: Crysta,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 6000,
    pricePerHour: 400,
    features: ['Captain-Seats', 'Premium Audio'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 3000
  },
  {
    id: '3',
    name: '26 Ertiga',
    image: ertiga,
    type: 'SUV',
    seats: 7,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 4000,
    pricePerHour: 350,
    features: ['Captain-Seats', 'Premium Audio'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 2500
  },
  
  {
    id: '4',
    name: 'HR Grey Duster',
    image: dusterKA,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1800
  },
  {
    id: '5',
    name: 'HR SilverDuster',
    image: duster1,
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 4000,
    pricePerHour: 200,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1800
  },
  {
    id: '6',
    name: 'Baleno 18',
    image: baleno,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1800
  },
  {
    id: '7',
    name: 'Polo Grey',
    image: Poloo,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Diesel',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1000
  },
  {
    id: '8',
    name: 'Black Ciaz',
    image: blackciaz,
    type: 'Sedan',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1800
  },
  {
    id: '9',
    name: 'White Swift',
    image: swift,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
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
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
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
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1800
  },
  {
    id: '12',
    name: 'Baleno Auto',
    image: balenoAuto,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 3500,
    pricePerHour: 200,
    features: ['Brand-new', 'Premium Audio'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1500
  },
  {
    id: '13',
    name: 'i20',
    image: i20,
    type: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuel: 'Petrol',
    pricePerDay: 3000,
    pricePerHour: 150,
    features: ['Auto Climate Control'],
    available: true,
    ownerName: 'Admin',
    ownerEmail: 'jixdriveblr@gmail.com',
    subscription: 1000
  }
];
