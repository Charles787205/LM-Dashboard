const { MongoClient } = require('mongodb');

// MongoDB connection string from your .env.local
const MONGODB_URI = 'mongodb://127.0.0.1:27017/int_tracker?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.3';

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('int_tracker');
    
    console.log('=== DATABASE DIAGNOSTIC ===');
    
    // Check hubs collection
    const hubsCollection = db.collection('hubs');
    const hubsCount = await hubsCollection.countDocuments();
    console.log(`\n📊 Hubs Collection: ${hubsCount} documents`);
    
    if (hubsCount > 0) {
      const sampleHub = await hubsCollection.findOne();
      console.log('Sample hub structure:');
      console.log(JSON.stringify(sampleHub, null, 2));
      
      const hubsWithTimestamps = await hubsCollection.countDocuments({
        createdAt: { $exists: true }
      });
      console.log(`Hubs with timestamps: ${hubsWithTimestamps}/${hubsCount}`);
    }
    
    // Check reports collection
    const reportsCollection = db.collection('reports');
    const reportsCount = await reportsCollection.countDocuments();
    console.log(`\n📊 Reports Collection: ${reportsCount} documents`);
    
    if (reportsCount > 0) {
      const sampleReport = await reportsCollection.findOne();
      console.log('Sample report structure:');
      console.log(JSON.stringify(sampleReport, null, 2));
      
      const reportsWithTimestamps = await reportsCollection.countDocuments({
        createdAt: { $exists: true }
      });
      console.log(`Reports with timestamps: ${reportsWithTimestamps}/${reportsCount}`);
    }
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 All collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();
