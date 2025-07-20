import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';
import Report from '@/models/Reports';
import Attendance from '@/models/Attendance';
import FailedDelivery from '@/models/Failed_Deliveries';
import Financials from '@/models/Financials';
import HubCost from '@/models/Hub_Cost';

// POST - Run timestamp migration
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const now = new Date();
    const results = {
      hubs: 0,
      reports: 0,
      reportsWithDate: 0,
      attendance: 0,
      failedDeliveries: 0,
      financials: 0,
      hubCosts: 0,
      hubCostsWithDate: 0
    };

    // Migration for Hubs
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
    results.hubs = hubsResult.modifiedCount;

    // Migration for Reports
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
    results.reports = reportsResult.modifiedCount;

    // For reports, use the existing 'date' field as a better createdAt estimate
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
        results.reportsWithDate++;
      }
    }

    // Migration for Attendance
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
    results.attendance = attendanceResult.modifiedCount;

    // Migration for Failed Deliveries
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
    results.failedDeliveries = failedDeliveryResult.modifiedCount;

    // Migration for Financials
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
    results.financials = financialsResult.modifiedCount;

    // Migration for Hub Costs
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
    results.hubCosts = hubCostResult.modifiedCount;

    // For hub costs with existing dates, use those as createdAt
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
        results.hubCostsWithDate++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Check migration status
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Count records without timestamps
    const results = {
      hubsNeedingMigration: await Hub.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      }),
      reportsNeedingMigration: await Report.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      }),
      attendanceNeedingMigration: await Attendance.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      }),
      failedDeliveriesNeedingMigration: await FailedDelivery.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      }),
      financialsNeedingMigration: await Financials.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      }),
      hubCostsNeedingMigration: await HubCost.countDocuments({
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      })
    };

    const totalNeedingMigration = Object.values(results).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      needsMigration: totalNeedingMigration > 0,
      totalNeedingMigration,
      details: results
    });

  } catch (error) {
    console.error('Migration status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
