#!/usr/bin/env node

/**
 * Migration script to add calculated fields (sdod, successRate, failedRate) to existing reports
 * 
 * Usage: node scripts/migrate-reports-calculated-fields.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all reports without the calculated fields
 * 3. Calculates SDOD, success rate, and failed rate for each report
 * 4. Updates the documents with the calculated values
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

// Report schema definition (simplified for migration)
const reportSchema = new mongoose.Schema({
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
  inbound: { type: Number, default: 0 },
  outbound: { type: Number, default: 0 },
  backlogs: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  sdod: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  failedRate: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

async function migrateReports() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find all reports that don't have calculated fields or have them as 0/null
    console.log('🔍 Finding reports that need migration...');
    const reportsToMigrate = await Report.find({
      $or: [
        { sdod: { $exists: false } },
        { successRate: { $exists: false } },
        { failedRate: { $exists: false } },
        { sdod: 0, successRate: 0, failedRate: 0 } // Also update reports where all are 0 (likely not calculated)
      ]
    });

    console.log(`📊 Found ${reportsToMigrate.length} reports to migrate`);

    if (reportsToMigrate.length === 0) {
      console.log('✅ No reports need migration. All reports already have calculated fields.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    console.log('🚀 Starting migration...');

    for (const report of reportsToMigrate) {
      try {
        // Calculate SDOD: outbound / (inbound + backlogs)
        let sdod = 0;
        const totalIncoming = report.inbound + report.backlogs;
        if (totalIncoming > 0) {
          sdod = (report.outbound / totalIncoming) * 100;
        }

        // Calculate success rate and failed rate
        let successRate = 0;
        let failedRate = 0;
        const totalProcessed = report.delivered + report.failed;
        
        if (totalProcessed > 0) {
          successRate = (report.delivered / totalProcessed) * 100;
          failedRate = (report.failed / totalProcessed) * 100;
        }

        // Update the report with calculated values
        await Report.findByIdAndUpdate(report._id, {
          $set: {
            sdod: Math.round(sdod * 10) / 10, // Round to 1 decimal place
            successRate: Math.round(successRate * 10) / 10,
            failedRate: Math.round(failedRate * 10) / 10
          }
        });

        successCount++;
        
        // Log progress every 100 reports
        if (successCount % 100 === 0) {
          console.log(`📈 Migrated ${successCount}/${reportsToMigrate.length} reports...`);
        }

      } catch (error) {
        console.error(`❌ Error migrating report ${report._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} reports`);
    console.log(`❌ Failed to migrate: ${errorCount} reports`);
    console.log(`📊 Total processed: ${successCount + errorCount} reports`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please check the error messages above.');
    }

    // Verify the migration by checking a few updated reports
    console.log('\n🔍 Verifying migration...');
    const sampleUpdatedReports = await Report.find({
      sdod: { $exists: true },
      successRate: { $exists: true },
      failedRate: { $exists: true }
    }).limit(3);

    console.log('📝 Sample updated reports:');
    sampleUpdatedReports.forEach((report, index) => {
      console.log(`  ${index + 1}. Report ${report._id}:`);
      console.log(`     - Inbound: ${report.inbound}, Backlogs: ${report.backlogs}, Outbound: ${report.outbound}`);
      console.log(`     - SDOD: ${report.sdod}%`);
      console.log(`     - Delivered: ${report.delivered}, Failed: ${report.failed}`);
      console.log(`     - Success Rate: ${report.successRate}%, Failed Rate: ${report.failedRate}%\n`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateReports()
    .then(() => {
      console.log('✨ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateReports };
