#!/usr/bin/env node

/**
 * Correction script to fix SDOD calculation in existing reports
 * Changes from (inbound + backlogs) / outbound to outbound / (inbound + backlogs)
 * 
 * Usage: node scripts/fix-sdod-calculation.js
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

async function fixSdodCalculation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find all reports with existing SDOD values that need correction
    console.log('🔍 Finding reports with SDOD values to correct...');
    const reportsToFix = await Report.find({
      sdod: { $exists: true, $ne: 0 }
    });

    console.log(`📊 Found ${reportsToFix.length} reports with SDOD values to correct`);

    if (reportsToFix.length === 0) {
      console.log('✅ No reports found with SDOD values to correct.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    console.log('🚀 Starting SDOD correction...');
    console.log('📝 Correcting formula from (inbound + backlogs) / outbound to outbound / (inbound + backlogs)');

    for (const report of reportsToFix) {
      try {
        // Show old calculation for comparison
        const oldSdod = report.sdod;
        
        // Calculate corrected SDOD: outbound / (inbound + backlogs)
        let newSdod = 0;
        const totalIncoming = report.inbound + report.backlogs;
        if (totalIncoming > 0) {
          newSdod = (report.outbound / totalIncoming) * 100;
        }

        // Update the report with corrected SDOD value
        await Report.findByIdAndUpdate(report._id, {
          $set: {
            sdod: Math.round(newSdod * 10) / 10 // Round to 1 decimal place
          }
        });

        successCount++;
        
        // Log sample corrections
        if (successCount <= 5) {
          console.log(`  📈 Report ${report._id}:`);
          console.log(`     - Data: inbound=${report.inbound}, backlogs=${report.backlogs}, outbound=${report.outbound}`);
          console.log(`     - Old SDOD: ${oldSdod}% (incorrect formula)`);
          console.log(`     - New SDOD: ${Math.round(newSdod * 10) / 10}% (correct formula)`);
        }
        
        // Log progress every 10 reports
        if (successCount % 10 === 0) {
          console.log(`📈 Corrected ${successCount}/${reportsToFix.length} reports...`);
        }

      } catch (error) {
        console.error(`❌ Error correcting report ${report._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📋 Correction Summary:');
    console.log(`✅ Successfully corrected: ${successCount} reports`);
    console.log(`❌ Failed to correct: ${errorCount} reports`);
    console.log(`📊 Total processed: ${successCount + errorCount} reports`);

    if (errorCount === 0) {
      console.log('\n🎉 SDOD correction completed successfully!');
    } else {
      console.log('\n⚠️  SDOD correction completed with some errors. Please check the error messages above.');
    }

    // Verify the correction by checking a few updated reports
    console.log('\n🔍 Verifying correction...');
    const sampleCorrectedReports = await Report.find({
      sdod: { $exists: true }
    }).limit(3);

    console.log('📝 Sample corrected reports:');
    sampleCorrectedReports.forEach((report, index) => {
      const totalIncoming = report.inbound + report.backlogs;
      const expectedSdod = totalIncoming > 0 ? (report.outbound / totalIncoming) * 100 : 0;
      console.log(`  ${index + 1}. Report ${report._id}:`);
      console.log(`     - Inbound: ${report.inbound}, Backlogs: ${report.backlogs}, Outbound: ${report.outbound}`);
      console.log(`     - Current SDOD: ${report.sdod}%`);
      console.log(`     - Expected SDOD: ${Math.round(expectedSdod * 10) / 10}% (${report.sdod === Math.round(expectedSdod * 10) / 10 ? '✅ Correct' : '❌ Mismatch'})\n`);
    });

  } catch (error) {
    console.error('❌ SDOD correction failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the correction
if (require.main === module) {
  fixSdodCalculation()
    .then(() => {
      console.log('✨ SDOD correction script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 SDOD correction script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixSdodCalculation };
