const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testTemplateGeneration() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we have any hubs
    const Hub = mongoose.model('Hub', new mongoose.Schema({
      name: String,
      client: String,
      location: String
    }));

    const hubs = await Hub.find().limit(1);
    
    if (hubs.length === 0) {
      console.log('❌ No hubs found in database. Please create a hub first.');
      return;
    }

    const hub = hubs[0];
    console.log('✅ Found hub:', hub.name);
    console.log('📁 Template generation API available at:');
    console.log(`   GET http://localhost:3000/api/hubs/${hub._id}/report-template`);
    console.log('');
    console.log('🌐 You can test this in the UI by:');
    console.log(`   1. Go to http://localhost:3000/hubs/${hub._id}/reports`);
    console.log('   2. Click the "Generate Template" button');
    console.log('   3. An Excel file will be downloaded with all the report headers');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testTemplateGeneration();
