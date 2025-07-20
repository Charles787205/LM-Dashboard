const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

// Load environment variables
loadEnvLocal();

// MongoDB connection string from .env.local
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not found in .env.local');
}

async function debugDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db('int_tracker');
    console.log('📁 Using database: int_tracker');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check hubs collection
    console.log('\n🏢 Checking hubs collection:');
    const hubsCollection = db.collection('hubs');
    const hubsCount = await hubsCollection.countDocuments();
    console.log(`  📊 Total hubs: ${hubsCount}`);
    
    if (hubsCount > 0) {
      console.log('\n🔍 Sample hubs:');
      const sampleHubs = await hubsCollection.find({}).limit(5).toArray();
      sampleHubs.forEach((hub, index) => {
        console.log(`  ${index + 1}. ${hub.name} (${hub.client}) - ID: ${hub._id}`);
      });
    }
    
    // Check reports collection
    console.log('\n📋 Checking reports collection:');
    const reportsCollection = db.collection('reports');
    const reportsCount = await reportsCollection.countDocuments();
    console.log(`  📊 Total reports: ${reportsCount}`);
    
    if (reportsCount > 0) {
      console.log('\n🔍 Sample reports:');
      const sampleReports = await reportsCollection.find({}).limit(3).toArray();
      sampleReports.forEach((report, index) => {
        console.log(`  ${index + 1}. Hub: ${report.hub}, Inbound: ${report.inbound}, Delivered: ${report.delivered}`);
      });
    }
    
    console.log('\n✅ Database debug completed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await client.close();
  }
}

debugDatabase();
