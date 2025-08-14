import { Service } from '../types';

// Define all services by vehicle category
export const servicesByCategory = {
  'Small Car': [
    {
      id: 'small-car-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 350,
      duration: '40 min',
      category: 'Small Car',
      icon: 'droplets',
      color: 'blue'
    },
    {
      id: 'small-car-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 550,
      duration: '1 hour',
      category: 'Small Car',
      icon: 'home',
      color: 'blue'
    },
    {
      id: 'small-car-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 1000,
      duration: '1 hour',
      category: 'Small Car',
      icon: 'sparkles',
      color: 'blue'
    },
    {
      id: 'small-car-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 1500,
      duration: '4 hours',
      category: 'Small Car',
      icon: 'wrench',
      color: 'blue'
    },
    {
      id: 'small-car-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 1500,
      duration: '2 hours',
      category: 'Small Car',
      icon: 'search',
      color: 'blue'
    },
    {
      id: 'small-car-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 500,
      duration: '1 hour',
      category: 'Small Car',
      icon: 'circle',
      color: 'blue'
    },
    {
      id: 'small-car-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 3000,
      duration: '5 hour',
      category: 'Small Car',
      icon: 'wind',
      color: 'blue'
    },
    {
      id: 'small-car-oil-change',
      name: 'Cermaic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 8000,
      duration: '1 day',
      category: 'Small Car',
      icon: 'droplet',
      color: 'blue'
    },
    {
      id: 'small-car-brake-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 9000,
      duration: '1 day',
      category: 'Small Car',
      icon: 'disc',
      color: 'blue'
    },
    {
      id: 'small-car-battery-service',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 55000,
      duration: '3 days',
      category: 'Small Car',
      icon: 'battery',
      color: 'blue'
    },
    {
      id: 'small-car-wheel-alignment',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 700,
      duration: '45 min',
      category: 'Small Car',
      icon: 'circle',
      color: 'blue'
    },
    {
      id: 'small-car-wheel-balancing',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 600,
      duration: '40 min',
      category: 'Small Car',
      icon: 'circle',
      color: 'blue'
    },
    {
      id: 'small-car-fluid-top-up',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 400,
      duration: '30 min',
      category: 'Small Car',
      icon: 'droplet',
      color: 'blue'
    },
    {
      id: 'small-car-suspension-check',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 500,
      duration: '40 min',
      category: 'Small Car',
      icon: 'activity',
      color: 'blue'
    },
    {
      id: 'small-car-diagnostic-scan',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 800,
      duration: '30 min',
      category: 'Small Car',
      icon: 'search',
      color: 'blue'
    },
    {
      id: 'small-car-denting-painting',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 2500,
      duration: '1 day',
      category: 'Small Car',
      icon: 'droplets',
      color: 'blue'
    },
    {
      id: 'small-car-ceramic-coating',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 500,
      duration: '1 hour',
      category: 'Small Car',
      icon: 'shield',
      color: 'blue'
    },
    {
      id: 'small-car-ppf',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicleﾕs interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 1800,
      duration: '4 hours',
      category: 'Small Car',
      icon: 'shield',
      color: 'blue'
    },
    {
      id: 'small-car-interior-detailing',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 2500,
      duration: '3 hours',
      category: 'Small Car',
      icon: 'home',
      color: 'blue'
    },
    {
      id: 'small-car-rubbing-polishing',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 1800,
      duration: '2 hours',
      category: 'Small Car',
      icon: 'sparkles',
      color: 'blue'
    }
  ],
  'Sedan Car': [
    {
      id: 'sedan-car-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 400,
      duration: '40 min',
      category: 'Sedan Car',
      icon: 'droplets',
      color: 'indigo'
    },
    {
      id: 'sedan-car-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 600,
      duration: '1 hour',
      category: 'Sedan Car',
      icon: 'home',
      color: 'indigo'
    },
    {
      id: 'sedan-car-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 1200,
      duration: '1 hour',
      category: 'Sedan Car',
      icon: 'sparkles',
      color: 'indigo'
    },
    {
      id: 'sedan-car-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 1800,
      duration: '4 hours',
      category: 'Sedan Car',
      icon: 'wrench',
      color: 'indigo'
    },
    {
      id: 'sedan-car-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 1800,
      duration: '2 hours',
      category: 'Sedan Car',
      icon: 'search',
      color: 'indigo'
    },
    {
      id: 'sedan-car-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 800,
      duration: '1 hour',
      category: 'Sedan Car',
      icon: 'circle',
      color: 'indigo'
    },
    {
      id: 'sedan-car-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 3500,
      duration: '5 hours',
      category: 'Sedan Car',
      icon: 'wind',
      color: 'indigo'
    },
    {
      id: 'sedan-car-oil-change',
      name: 'Cermaic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 9000,
      duration: '1 day',
      category: 'Sedan Car',
      icon: 'droplet',
      color: 'indigo'
    },
    {
      id: 'sedan-car-brake-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 10000,
      duration: '1 day',
      category: 'Sedan Car',
      icon: 'disc',
      color: 'indigo'
    },
    {
      id: 'sedan-car-battery-service',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 60000,
      duration: '3 days',
      category: 'Sedan Car',
      icon: 'battery',
      color: 'indigo'
    },
    {
      id: 'sedan-car-wheel-alignment',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 700,
      duration: '1 hour',
      category: 'Sedan Car',
      icon: 'circle',
      color: 'indigo'
    },
    {
      id: 'sedan-car-wheel-balancing',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicles interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 2200,
      duration: '4 hours',
      category: 'Sedan Car',
      icon: 'circle',
      color: 'indigo'
    },
    {
      id: 'sedan-car-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 450,
      duration: '30 min',
      category: 'Sedan Car',
      icon: 'droplet',
      color: 'indigo'
    },
    {
      id: 'sedan-car-filter-replacement',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 900,
      duration: '45 min',
      category: 'Sedan Car',
      icon: 'wind',
      color: 'indigo'
    },
    {
      id: 'sedan-car-spark-plug',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 700,
      duration: '45 min',
      category: 'Sedan Car',
      icon: 'zap',
      color: 'indigo'
    },
    {
      id: 'sedan-car-suspension-check',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 600,
      duration: '40 min',
      category: 'Sedan Car',
      icon: 'activity',
      color: 'indigo'
    },
    {
      id: 'sedan-car-diagnostic-scan',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 900,
      duration: '30 min',
      category: 'Sedan Car',
      icon: 'search',
      color: 'indigo'
    },
    {
      id: 'sedan-car-denting-painting',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 3000,
      duration: '1 day',
      category: 'Sedan Car',
      icon: 'droplets',
      color: 'indigo'
    },
    {
      id: 'sedan-car-ceramic-coating',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 10000,
      duration: '1 day',
      category: 'Sedan Car',
      icon: 'shield',
      color: 'indigo'
    },
    {
      id: 'sedan-car-ppf',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 18000,
      duration: '2 days',
      category: 'Sedan Car',
      icon: 'shield',
      color: 'indigo'
    }
  ],
  'Compact SUV': [
    {
      id: 'compact-suv-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 450,
      duration: '40 min',
      category: 'Compact SUV',
      icon: 'droplets',
      color: 'orange'
    },
    {
      id: 'compact-suv-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 650,
      duration: '1 hour',
      category: 'Compact SUV',
      icon: 'home',
      color: 'orange'
    },
    {
      id: 'compact-suv-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 1400,
      duration: '1 hour',
      category: 'Compact SUV',
      icon: 'sparkles',
      color: 'orange'
    },
    {
      id: 'compact-suv-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 2000,
      duration: '4 hours',
      category: 'Compact SUV',
      icon: 'wrench',
      color: 'orange'
    },
    {
      id: 'compact-suv-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 2000,
      duration: '2 hours',
      category: 'Compact SUV',
      icon: 'search',
      color: 'orange'
    },
    {
      id: 'compact-suv-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 1000,
      duration: '1 hour',
      category: 'Compact SUV',
      icon: 'circle',
      color: 'orange'
    },
    {
      id: 'compact-suv-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 4000,
      duration: '5 hours',
      category: 'Compact SUV',
      icon: 'wind',
      color: 'orange'
    },
    {
      id: 'compact-suv-oil-change',
      name: 'Cermaic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 13000,
      duration: '1 day',
      category: 'Compact SUV',
      icon: 'droplet',
      color: 'orange'
    },
    {
      id: 'compact-suv-brake-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 15000,
      duration: '1 day',
      category: 'Compact SUV',
      icon: 'disc',
      color: 'orange'
    },
    {
      id: 'compact-suv-battery-service',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 65000,
      duration: '3 days',
      category: 'Compact SUV',
      icon: 'battery',
      color: 'orange'
    },
    {
      id: 'compact-suv-wheel-alignment',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 1000,
      duration: '1 hour',
      category: 'Compact SUV',
      icon: 'circle',
      color: 'orange'
    },
    {
      id: 'compact-suv-wheel-balancing',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicleﾕs interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 2500,
      duration: '4 hours',
      category: 'Compact SUV',
      icon: 'circle',
      color: 'orange'
    },
    {
      id: 'compact-suv-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 500,
      duration: '30 min',
      category: 'Compact SUV',
      icon: 'droplet',
      color: 'orange'
    },
    {
      id: 'compact-suv-filter-replacement',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 1000,
      duration: '45 min',
      category: 'Compact SUV',
      icon: 'wind',
      color: 'orange'
    },
    {
      id: 'compact-suv-spark-plug',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 800,
      duration: '45 min',
      category: 'Compact SUV',
      icon: 'zap',
      color: 'orange'
    },
    {
      id: 'compact-suv-suspension-check',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 700,
      duration: '40 min',
      category: 'Compact SUV',
      icon: 'activity',
      color: 'orange'
    },
    {
      id: 'compact-suv-diagnostic-scan',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 1000,
      duration: '30 min',
      category: 'Compact SUV',
      icon: 'search',
      color: 'orange'
    },
    {
      id: 'compact-suv-denting-painting',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 3500,
      duration: '1 day',
      category: 'Compact SUV',
      icon: 'droplets',
      color: 'orange'
    },
    {
      id: 'compact-suv-ceramic-coating',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 12000,
      duration: '1 day',
      category: 'Compact SUV',
      icon: 'shield',
      color: 'orange'
    },
    {
      id: 'compact-suv-ppf',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 20000,
      duration: '2 days',
      category: 'Compact SUV',
      icon: 'shield',
      color: 'orange'
    }
  ],
  'SUV': [
    {
      id: 'suv-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 500,
      duration: '40 min',
      category: 'SUV',
      icon: 'droplets',
      color: 'green'
    },
    {
      id: 'suv-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 700,
      duration: '1 hour',
      category: 'SUV',
      icon: 'home',
      color: 'green'
    },
    {
      id: 'suv-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 1600,
      duration: '1 hour',
      category: 'SUV',
      icon: 'sparkles',
      color: 'green'
    },
    {
      id: 'suv-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 2400,
      duration: '4 hours',
      category: 'SUV',
      icon: 'wrench',
      color: 'green'
    },
    {
      id: 'suv-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 2400,
      duration: '2 hours',
      category: 'SUV',
      icon: 'search',
      color: 'green'
    },
    {
      id: 'suv-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 1500,
      duration: '1 hour',
      category: 'SUV',
      icon: 'circle',
      color: 'green'
    },
    {
      id: 'suv-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 4500,
      duration: '5 hours',
      category: 'SUV',
      icon: 'wind',
      color: 'green'
    },
    {
      id: 'suv-oil-change',
      name: 'Cermaic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 15000,
      duration: '1 day',
      category: 'SUV',
      icon: 'droplet',
      color: 'green'
    },
    {
      id: 'suv-brake-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 18000,
      duration: '1 day',
      category: 'SUV',
      icon: 'disc',
      color: 'green'
    },
    {
      id: 'suv-battery-service',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 75000,
      duration: '3 days',
      category: 'SUV',
      icon: 'battery',
      color: 'green'
    },
    {
      id: 'suv-wheel-alignment',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 1500,
      duration: '1 hour',
      category: 'SUV',
      icon: 'circle',
      color: 'green'
    },
    {
      id: 'suv-wheel-balancing',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicleﾕs interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 3000,
      duration: '4 hours',
      category: 'SUV',
      icon: 'circle',
      color: 'green'
    },
    {
      id: 'suv-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 3000,
      duration: '4 hours',
      category: 'SUV',
      icon: 'droplet',
      color: 'green'
    },
    {
      id: 'suv-filter-replacement',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 1200,
      duration: '1 hour',
      category: 'SUV',
      icon: 'wind',
      color: 'green'
    },
    {
      id: 'suv-spark-plug',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 900,
      duration: '1 hour',
      category: 'SUV',
      icon: 'zap',
      color: 'green'
    },
    {
      id: 'suv-suspension-check',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 800,
      duration: '45 min',
      category: 'SUV',
      icon: 'activity',
      color: 'green'
    },
    {
      id: 'suv-diagnostic-scan',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 1100,
      duration: '40 min',
      category: 'SUV',
      icon: 'search',
      color: 'green'
    },
    {
      id: 'suv-denting-painting',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 4000,
      duration: '1-2 days',
      category: 'SUV',
      icon: 'droplets',
      color: 'green'
    },
    {
      id: 'suv-ceramic-coating',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 15000,
      duration: '1-2 days',
      category: 'SUV',
      icon: 'shield',
      color: 'green'
    },
    {
      id: 'suv-ppf',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 25000,
      duration: '2-3 days',
      category: 'SUV',
      icon: 'shield',
      color: 'green'
    }
  ],
  'Luxury': [
    {
      id: 'luxury-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 800,
      duration: '40 min',
      category: 'Luxury',
      icon: 'droplets',
      color: 'purple'
    },
    {
      id: 'luxury-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 1000,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'home',
      color: 'purple'
    },
    {
      id: 'luxury-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 2000,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'sparkles',
      color: 'purple'
    },
    {
      id: 'luxury-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 3000,
      duration: '4 hours',
      category: 'Luxury',
      icon: 'wrench',
      color: 'purple'
    },
    {
      id: 'luxury-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 3000,
      duration: '2 hours',
      category: 'Luxury',
      icon: 'search',
      color: 'purple'
    },
    {
      id: 'luxury-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 2000,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'circle',
      color: 'purple'
    },
    {
      id: 'luxury-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 6000,
      duration: '5 hours',
      category: 'Luxury',
      icon: 'wind',
      color: 'purple'
    },
    {
      id: 'luxury-oil-change',
      name: 'Cermaic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 18000,
      duration: '1 day',
      category: 'Luxury',
      icon: 'droplet',
      color: 'purple'
    },
    {
      id: 'luxury-brake-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 20000,
      duration: '1 day',
      category: 'Luxury',
      icon: 'disc',
      color: 'purple'
    },
    {
      id: 'luxury-battery-service',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 85000,
      duration: '3 days',
      category: 'Luxury',
      icon: 'battery',
      color: 'purple'
    },
    {
      id: 'luxury-wheel-alignment',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 2500,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'circle',
      color: 'purple'
    },
    {
      id: 'luxury-wheel-balancing',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicleﾕs interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 4000,
      duration: '4 hours',
      category: 'Luxury',
      icon: 'circle',
      color: 'purple'
    },
    {
      id: 'luxury-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 900,
      duration: '40 min',
      category: 'Luxury',
      icon: 'droplet',
      color: 'purple'
    },
    {
      id: 'luxury-filter-replacement',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 1800,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'wind',
      color: 'purple'
    },
    {
      id: 'luxury-spark-plug',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 1500,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'zap',
      color: 'purple'
    },
    {
      id: 'luxury-suspension-check',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 1200,
      duration: '1 hour',
      category: 'Luxury',
      icon: 'activity',
      color: 'purple'
    },
    {
      id: 'luxury-diagnostic-scan',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 1800,
      duration: '45 min',
      category: 'Luxury',
      icon: 'search',
      color: 'purple'
    },
    {
      id: 'luxury-denting-painting',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 6000,
      duration: '2-3 days',
      category: 'Luxury',
      icon: 'droplets',
      color: 'purple'
    },
    {
      id: 'luxury-ceramic-coating',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 25000,
      duration: '2-3 days',
      category: 'Luxury',
      icon: 'shield',
      color: 'purple'
    },
    {
      id: 'luxury-ppf',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 35000,
      duration: '3-4 days',
      category: 'Luxury',
      icon: 'shield',
      color: 'purple'
    }
  ],
  'Yellow Board': [
    {
      id: 'yellow-board-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 350,
      duration: '40 min',
      category: 'Yellow Board',
      icon: 'droplets',
      color: 'yellow'
    },
    {
      id: 'yellow-board-interior-cleaning',
      name: 'Full Wash',
      description: 'Comprehensive exterior cleaning including body wash, wheel cleaning, and under chassis wash to remove dirt, mud, and road debris from all parts of the vehicle.',
      price: 500,
      duration: '1 hour',
      category: 'Yellow Board',
      icon: 'home',
      color: 'yellow'
    },
    {
      id: 'yellow-board-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 650,
      duration: '1 hour',
      category: 'Yellow Board',
      icon: 'sparkles',
      color: 'yellow'
    },
    {
      id: 'yellow-board-engine-wash',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 1200,
      duration: '4 hours',
      category: 'Yellow Board',
      icon: 'wrench',
      color: 'yellow'
    },
    {
      id: 'yellow-board-headlight-restoration',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 1200,
      duration: '2 hours',
      category: 'Yellow Board',
      icon: 'search',
      color: 'yellow'
    },
    {
      id: 'yellow-board-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 300,
      duration: '1 hour',
      category: 'Yellow Board',
      icon: 'circle',
      color: 'yellow'
    },
    {
      id: 'yellow-board-ac-service',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 2500,
      duration: '5 hours',
      category: 'Yellow Board',
      icon: 'wind',
      color: 'yellow'
    },
    {
      id: 'yellow-board-oil-change',
      name: 'Ac vent Cleaning',
      description: 'Deep cleaning of air conditioning vents to remove dust, allergens, and bacteria, improving air quality and cooling efficiency.',
      price: 800,
      duration: '1 hour',
      category: 'Yellow Board',
      icon: 'droplet',
      color: 'yellow'
    },
    {
      id: 'yellow-board-brake-service',
      name: 'Interior Cleaning',
      description: 'Complete cleaning of the vehicleﾕs interior including seats, carpets, dashboard, and panels for a fresh and hygienic cabin.',
      price: 1800,
      duration: '4 hours',
      category: 'Yellow Board',
      icon: 'disc',
      color: 'yellow'
    },
    {
      id: 'yellow-board-battery-service',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 250,
      duration: '30 min',
      category: 'Yellow Board',
      icon: 'battery',
      color: 'yellow'
    },
    {
      id: 'yellow-board-wheel-alignment',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 700,
      duration: '45 min',
      category: 'Yellow Board',
      icon: 'circle',
      color: 'yellow'
    },
    {
      id: 'yellow-board-wheel-balancing',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 600,
      duration: '40 min',
      category: 'Yellow Board',
      icon: 'circle',
      color: 'yellow'
    },
    {
      id: 'yellow-board-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 400,
      duration: '30 min',
      category: 'Yellow Board',
      icon: 'droplet',
      color: 'yellow'
    },
    {
      id: 'yellow-board-filter-replacement',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 800,
      duration: '45 min',
      category: 'Yellow Board',
      icon: 'wind',
      color: 'yellow'
    },
    {
      id: 'yellow-board-spark-plug',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 600,
      duration: '45 min',
      category: 'Yellow Board',
      icon: 'zap',
      color: 'yellow'
    },
    {
      id: 'yellow-board-suspension-check',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 500,
      duration: '40 min',
      category: 'Yellow Board',
      icon: 'activity',
      color: 'yellow'
    },
    {
      id: 'yellow-board-diagnostic-scan',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 800,
      duration: '30 min',
      category: 'Yellow Board',
      icon: 'search',
      color: 'yellow'
    },
    {
      id: 'yellow-board-denting-painting',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 2500,
      duration: '1 day',
      category: 'Yellow Board',
      icon: 'droplets',
      color: 'yellow'
    }
  ],
  'Bike': [
    {
      id: 'bike-body-wash',
      name: 'Body Wash',
      description: 'Thorough cleaning of the vehicle\'s exterior using car shampoo to remove dirt, dust, and road grime without damaging the paint.',
      price: 200,
      duration: '30 min',
      category: 'Bike',
      icon: 'droplets',
      color: 'red'
    },
    {
      id: 'bike-polish',
      name: 'Diesel Wash',
      description: 'Specialized cleaning process to remove diesel stains, oil residues, and soot from the vehicleﾕs body and engine bay.',
      price: 250,
      duration: '10 min',
      category: 'Bike',
      icon: 'sparkles',
      color: 'red'
    },
    {
      id: 'bike-engine-wash',
      name: 'Chain Lube',
      description: 'Lubrication of motorcycle or bicycle chains to reduce friction, prevent rust, and ensure smooth operation.',
      price: 50,
      duration: '5 min',
      category: 'Bike',
      icon: 'wrench',
      color: 'red'
    },
    {
      id: 'bike-headlight-restoration',
      name: 'Hard Water Removal',
      description: 'Treatment to remove hard water stains, mineral deposits, and spots from the vehicleﾕs paint, glass, and chrome surfaces.',
      price: 800,
      duration: '5 hours',
      category: 'Bike',
      icon: 'search',
      color: 'red'
    },
    {
      id: 'bike-wheel-cleaning',
      name: 'Wax Polish',
      description: 'Application of a protective wax layer to enhance shine, protect paint from UV rays, and repel dirt and water.',
      price: 50,
      duration: '15 min',
      category: 'Bike',
      icon: 'circle',
      color: 'red'
    },
    {
      id: 'bike-oil-change',
      name: '3 Step Polish',
      description: 'Multi-stage polishing process involving compounding, polishing, and finishing to restore paint clarity and remove imperfections.',
      price: 1500,
      duration: '3 hours',
      category: 'Bike',
      icon: 'droplet',
      color: 'red'
    },
    {
      id: 'bike-brake-service',
      name: 'Ceramic',
      description: 'Advanced ceramic coating that provides long-lasting protection, high gloss, and hydrophobic properties for vehicle surfaces.',
      price: 5000,
      duration: '6 hours',
      category: 'Bike',
      icon: 'disc',
      color: 'red'
    },
    {
      id: 'bike-battery-service',
      name: 'Graphene',
      description: 'Application of graphene-based coating for superior durability, heat resistance, and water repellency compared to traditional coatings.',
      price: 7000,
      duration: '1 day',
      category: 'Bike',
      icon: 'battery',
      color: 'red'
    },
    {
      id: 'bike-wheel-alignment',
      name: 'PPF',
      description: 'Transparent, self-healing paint protection film applied to vehicle surfaces to guard against scratches, chips, and UV damage.',
      price: 12000,
      duration: '1 day',
      category: 'Bike',
      icon: 'circle',
      color: 'red'
    },
    {
      id: 'bike-chain-lubrication',
      name: 'Head Light Restoration',
      description: 'Restoration process that removes yellowing, oxidation, and scratches from headlights to improve clarity and brightness.',
      price: 500,
      duration: '1 hour',
      category: 'Bike',
      icon: 'link',
      color: 'red'
    },
    {
      id: 'bike-fluid-top-up',
      name: 'Mechanic Work',
      description: 'Repair and maintenance services for engines, brakes, suspension, transmission, and other mechanical components to ensure safe and reliable vehicle operation.',
      price: 200,
      duration: '20 min',
      category: 'Bike',
      icon: 'droplet',
      color: 'red'
    },
    {
      id: 'bike-filter-replacement',
      name: 'Tyre Change',
      description: 'Replacement of worn or damaged tyres, including wheel balancing and alignment to ensure safety, stability, and even tyre wear.',
      price: 300,
      duration: '30 min',
      category: 'Bike',
      icon: 'wind',
      color: 'red'
    },
    {
      id: 'bike-spark-plug',
      name: 'Rim Restoration',
      description: 'Repair and refinishing of damaged or scratched rims to restore their original look, strength, and shine.',
      price: 250,
      duration: '30 min',
      category: 'Bike',
      icon: 'zap',
      color: 'red'
    },
    {
      id: 'bike-suspension-check',
      name: 'Dent & Paint',
      description: 'Repair of dents and scratches followed by professional paintwork to restore the vehicleﾕs original finish.',
      price: 300,
      duration: '30 min',
      category: 'Bike',
      icon: 'activity',
      color: 'red'
    },
    {
      id: 'bike-diagnostic-scan',
      name: 'Seat Cover',
      description: 'Installation or replacement of seat covers to enhance comfort, style, and protection for the vehicleﾕs interior.',
      price: 400,
      duration: '20 min',
      category: 'Bike',
      icon: 'search',
      color: 'red'
    },
    {
      id: 'bike-denting-painting',
      name: 'Accessories',
      description: 'Supply and installation of car accessories such as floor mats, roof racks, infotainment systems, and lighting upgrades.',
      price: 1500,
      duration: '1 day',
      category: 'Bike',
      icon: 'droplets',
      color: 'red'
    },
    {
      id: 'bike-periodic-maintenance',
      name: 'Periodic Maintenance',
      description: 'Scheduled vehicle servicing that includes oil changes, filter replacements, fluid top-ups, and inspection of essential components to ensure optimal performance and longevity.',
      price: 3000,
      duration: '1 day',
      category: 'Bike',
      icon: 'shield',
      color: 'red'
    },
    {
      id: 'bike-others',
      name: 'Others',
      description: 'Any additional services or custom requests not covered in the listed categories.',
      price: 3000,
      duration: '1 day',
      category: 'Bike',
      icon: 'shield',
      color: 'red'
    }
  ]
};

// Default category is 'Small Car'
const defaultCategory = 'Small Car';

// Export services for the default category as the default export
export const services: Service[] = servicesByCategory[defaultCategory];