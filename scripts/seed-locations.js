import { connectToDatabase } from '../lib/mongoose.js';
import Location from '../models/transport/Location.js';

const seedLocations = async () => {
  try {
    await connectToDatabase();
    
    // Check if locations already exist
    const existingLocations = await Location.countDocuments();
    if (existingLocations > 0) {
      console.log('Locations already exist. Skipping seed.');
      return;
    }

    const initialLocations = [
      {
        name: 'Warehouse A',
        type: 'origin'
      },
      {
        name: 'Warehouse B',
        type: 'origin'
      },
      {
        name: 'Distribution Center',
        type: 'both'
      },
      {
        name: 'Customer Hub Metro Manila',
        type: 'destination'
      },
      {
        name: 'Customer Hub Cebu',
        type: 'destination'
      },
      {
        name: 'Regional Hub Davao',
        type: 'both'
      },
      {
        name: 'Main Warehouse - QC',
        type: 'origin'
      },
      {
        name: 'Customer Hub Baguio',
        type: 'destination'
      },
      {
        name: 'Transit Hub Batangas',
        type: 'both'
      },
      {
        name: 'Customer Hub Iloilo',
        type: 'destination'
      }
    ];

    console.log('Seeding locations...');
    
    for (const locationData of initialLocations) {
      try {
        const location = new Location(locationData);
        await location.save();
        console.log(`✓ Created location: ${locationData.name} (${locationData.type})`);
      } catch (error) {
        console.error(`✗ Failed to create location ${locationData.name}:`, error.message);
      }
    }

    console.log('Location seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding locations:', error);
    process.exit(1);
  }
};

seedLocations();
