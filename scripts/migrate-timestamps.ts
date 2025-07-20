/**
 * Migration script to add timestamps to existing records
 * Run this script once to add createdAt and updatedAt fields to existing data
 */

import { connectToDatabase } from '../lib/mongoose';
import Hub from '../models/Hubs';
import Report from '../models/Reports';
import Attendance from '../models/Attendance';
import FailedDelivery from '../models/Failed_Deliveries';
import Financials from '../models/Financials';
import HubCost from '../models/Hub_Cost';

async function migrateTimestamps() {
  try {
    await connectToDatabase();
    console.log('Connected to database successfully');

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

    // For reports, we can try to use the existing 'date' field as a better createdAt estimate
    console.log('Setting Reports createdAt based on report date...');
    const reports = await Report.find({ 
      date: { $exists: true },
      createdAt: now // Only update records we just set to 'now'
    });
    
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
      }
    }
    console.log(`✅ Updated ${reports.length} report records with date-based createdAt`);

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
      }
    }
    console.log(`✅ Updated ${hubCosts.length} hub cost records with date-based createdAt`);

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
    process.exit(0);
  }
}

// Run the migration
if (require.main === module) {
  migrateTimestamps();
}

export default migrateTimestamps;
