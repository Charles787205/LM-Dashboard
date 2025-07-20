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

async function addTimestampsToExistingRecords() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('int_tracker');
    
    console.log('=== MIGRATION: Adding Timestamps to Existing Records ===');
    
    // Define collections that need timestamps
    const collections = [
      'hubs',
      'reports', 
      'attendances',
      'faileddeliveries',
      'financials',
      'hubcosts'
    ];
    
    for (const collectionName of collections) {
      console.log(`\n📁 Processing collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const totalCount = await collection.countDocuments();
      
      if (totalCount === 0) {
        console.log(`  ⏭️  Skipping ${collectionName} - no documents`);
        continue;
      }
      
      console.log(`  📊 Total documents: ${totalCount}`);
      
      // Find documents missing createdAt
      const missingCreatedAt = await collection.countDocuments({
        createdAt: { $exists: false }
      });
      
      // Find documents missing updatedAt
      const missingUpdatedAt = await collection.countDocuments({
        updatedAt: { $exists: false }
      });
      
      console.log(`  🔍 Missing createdAt: ${missingCreatedAt}`);
      console.log(`  🔍 Missing updatedAt: ${missingUpdatedAt}`);
      
      // Set default timestamp - use current time for existing records
      const defaultTimestamp = new Date();
      
      // Update documents missing createdAt
      if (missingCreatedAt > 0) {
        const result1 = await collection.updateMany(
          { createdAt: { $exists: false } },
          { 
            $set: { 
              createdAt: defaultTimestamp 
            } 
          }
        );
        console.log(`  ✅ Added createdAt to ${result1.modifiedCount} documents`);
      }
      
      // Update documents missing updatedAt
      if (missingUpdatedAt > 0) {
        const result2 = await collection.updateMany(
          { updatedAt: { $exists: false } },
          { 
            $set: { 
              updatedAt: defaultTimestamp 
            } 
          }
        );
        console.log(`  ✅ Added updatedAt to ${result2.modifiedCount} documents`);
      }
      
      // Verify the migration
      const finalWithTimestamps = await collection.countDocuments({
        createdAt: { $exists: true },
        updatedAt: { $exists: true }
      });
      
      console.log(`  ✅ Final result: ${finalWithTimestamps}/${totalCount} documents have both timestamps`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

addTimestampsToExistingRecords();
