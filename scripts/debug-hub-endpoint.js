#!/usr/bin/env node

/**
 * Debug script to test hub endpoint performance
 * Usage: node scripts/debug-hub-endpoint.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const hubId = '686be51fb1dcf6079c921176';

async function debugHubEndpoint() {
    console.log('🔍 Starting hub endpoint debugging...');
    console.log('📋 Hub ID:', hubId);
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    try {
        // Connect to database
        console.log('\n⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Define hub schema
        const hubSchema = new mongoose.Schema({
            name: String,
            client: String,
            location: String,
            hub_cost_per_parcel: {
                '2W': Number,
                '3W': Number,
                '4W': Number
            },
            hub_profit_per_parcel: {
                '2W': Number,
                '3W': Number,
                '4W': Number
            },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        const Hub = mongoose.models.Hub || mongoose.model('Hub', hubSchema);

        // Test 1: Check if hub exists
        console.log('\n🔍 Test 1: Checking if hub exists...');
        const startTime1 = Date.now();
        
        try {
            const hub = await Hub.findById(hubId);
            const endTime1 = Date.now();
            
            if (hub) {
                console.log('✅ Hub found!');
                console.log('📊 Hub details:', {
                    id: hub._id,
                    name: hub.name,
                    client: hub.client,
                    location: hub.location
                });
                console.log('⏱️  Query time:', endTime1 - startTime1, 'ms');
            } else {
                console.log('❌ Hub not found with ID:', hubId);
                
                // Show available hubs
                console.log('\n📋 Available hubs:');
                const allHubs = await Hub.find({}).limit(5);
                allHubs.forEach(h => {
                    console.log(`  - ${h._id}: ${h.name} (${h.client})`);
                });
            }
        } catch (hubError) {
            console.log('❌ Error finding hub:', hubError.message);
        }

        // Test 2: Check reports for this hub
        console.log('\n🔍 Test 2: Checking reports for this hub...');
        const reportSchema = new mongoose.Schema({
            hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
            inbound: Number,
            outbound: Number,
            delivered: Number,
            failed: Number,
            backlogs: Number,
            date: Date,
            createdAt: { type: Date, default: Date.now }
        });

        const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

        const startTime2 = Date.now();
        try {
            const reports = await Report.find({ hub: hubId })
                .sort({ date: -1 })
                .limit(10)
                .populate('hub', 'name client');
            
            const endTime2 = Date.now();
            console.log('✅ Reports query completed');
            console.log('📊 Found', reports.length, 'reports');
            console.log('⏱️  Query time:', endTime2 - startTime2, 'ms');
            
            if (reports.length > 0) {
                console.log('📋 Recent reports:');
                reports.slice(0, 3).forEach(r => {
                    console.log(`  - ${r.date}: Inbound: ${r.inbound}, Outbound: ${r.outbound}, Delivered: ${r.delivered}`);
                });
            }
        } catch (reportError) {
            console.log('❌ Error finding reports:', reportError.message);
        }

        // Test 3: Check database performance
        console.log('\n🔍 Test 3: Database performance check...');
        const startTime3 = Date.now();
        
        try {
            const db = mongoose.connection.db;
            const stats = await db.admin().serverStatus();
            const endTime3 = Date.now();
            
            console.log('✅ Database server status check completed');
            console.log('⏱️  Response time:', endTime3 - startTime3, 'ms');
            console.log('📊 Database info:', {
                version: stats.version,
                uptime: Math.round(stats.uptime / 3600) + ' hours',
                connections: stats.connections.current + '/' + stats.connections.available
            });
        } catch (statusError) {
            console.log('❌ Error checking server status:', statusError.message);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✨ Debugging completed');
    }
}

// Run the debug script
debugHubEndpoint().catch(console.error);
