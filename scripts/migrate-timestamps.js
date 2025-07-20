/**
 * Migration script to add timestamps to existing records
 * Run with: node scripts/migrate-timestamps.js
 */

const mongoose = require('mongoose');
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

// MongoDB connection
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env.local');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Define schemas with timestamps
const hubSchema = new mongoose.Schema({
  name: String,
  client: String,
  hub_cost_per_parcel: {
    "2W": Number,
    "3W": Number,
    "4W": Number
  },
  hub_profit_per_parcel: {
    "2W": Number,
    "3W": Number,
    "4W": Number
  }
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  inbound: Number,
  outbound: Number,
  backlogs: Number,
  delivered: Number,
  failed: Number,
  misroutes: Number,
  date: Date,
  attendance: {
    hub_lead: Number,
    backroom: Number
  },
  trips: {
    "2w": Number,
    "3w": Number,
    "4w": Number
  },
  successful_deliveries: {
    "2w": Number,
    "3w": Number,
    "4w": Number
  }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  hub_lead: Number,
  backroom: Number,
  drivers_2w: Number,
  drivers_3w: Number,
  drivers_4w: Number
}, { timestamps: true });

const failedDeliverySchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  canceled_bef_delivery: Number,
  no_cash_available: Number,
  postpone: Number,
  not_at_home: Number,
  refuse: Number,
  unreachable: Number,
  invalid_address: Number
}, { timestamps: true });

const financialsSchema = new mongoose.Schema({
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  cost: Number,
  revenue: Number,
  profit: Number
}, { timestamps: true });

const hubCostSchema = new mongoose.Schema({
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  name: String,
  cost: Number,
  cost_type: String,
  date: Date
}, { timestamps: true });

// Models
const Hub = mongoose.models.Hub || mongoose.model('Hub', hubSchema);
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const FailedDelivery = mongoose.models.FailedDelivery || mongoose.model('FailedDelivery', failedDeliverySchema);
const Financials = mongoose.models.Financials || mongoose.model('Financials', financialsSchema);
const HubCost = mongoose.models.HubCost || mongoose.model('HubCost', hubCostSchema);

async function migrateTimestamps() {
  try {
    await connectToDatabase();
    console.log('Starting timestamp migration...\n');

    const now = new Date();
    
    // Migration for Hubs
    console.log('Migrating Hubs...');
    const hubsResult = await Hub.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${hubsResult.modifiedCount} hub records`);

    // Migration for Reports
    console.log('Migrating Reports...');
    const reportsResult = await Report.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${reportsResult.modifiedCount} report records`);

    // For reports, use the existing 'date' field as a better createdAt estimate
    console.log('Setting Reports createdAt based on report date...');
    const reports = await Report.find({ 
      date: { $exists: true },
      createdAt: now // Only update records we just set to 'now'
    });
    
    let updatedReportsCount = 0;
    for (const report of reports) {
      if (report.date) {
        await Report.updateOne(
          { _id: report._id },
          { 
            $set: { 
              createdAt: report.date,
              updatedAt: now
            }
          }
        );
        updatedReportsCount++;
      }
    }
    console.log(`✅ Updated ${updatedReportsCount} report records with date-based createdAt`);

    // Migration for Attendance
    console.log('Migrating Attendance...');
    const attendanceResult = await Attendance.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${attendanceResult.modifiedCount} attendance records`);

    // Migration for Failed Deliveries
    console.log('Migrating Failed Deliveries...');
    const failedDeliveryResult = await FailedDelivery.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${failedDeliveryResult.modifiedCount} failed delivery records`);

    // Migration for Financials
    console.log('Migrating Financials...');
    const financialsResult = await Financials.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${financialsResult.modifiedCount} financial records`);

    // Migration for Hub Costs
    console.log('Migrating Hub Costs...');
    const hubCostResult = await HubCost.updateMany(
      { 
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      { 
        $set: { 
          createdAt: now,
          updatedAt: now
        }
      }
    );
    console.log(`✅ Updated ${hubCostResult.modifiedCount} hub cost records`);

    // For hub costs with existing dates, use those as createdAt
    console.log('Setting Hub Costs createdAt based on existing date...');
    const hubCosts = await HubCost.find({ 
      date: { $exists: true },
      createdAt: now // Only update records we just set to 'now'
    });
    
    let updatedHubCostsCount = 0;
    for (const hubCost of hubCosts) {
      if (hubCost.date) {
        await HubCost.updateOne(
          { _id: hubCost._id },
          { 
            $set: { 
              createdAt: hubCost.date,
              updatedAt: now
            }
          }
        );
        updatedHubCostsCount++;
      }
    }
    console.log(`✅ Updated ${updatedHubCostsCount} hub cost records with date-based createdAt`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Hubs: ${hubsResult.modifiedCount} records updated`);
    console.log(`- Reports: ${reportsResult.modifiedCount} records updated`);
    console.log(`- Attendance: ${attendanceResult.modifiedCount} records updated`);
    console.log(`- Failed Deliveries: ${failedDeliveryResult.modifiedCount} records updated`);
    console.log(`- Financials: ${financialsResult.modifiedCount} records updated`);
    console.log(`- Hub Costs: ${hubCostResult.modifiedCount} records updated`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateTimestamps();
