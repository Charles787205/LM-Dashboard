import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';
import Report from '@/models/Reports';
import FailedDelivery from '@/models/Failed_Deliveries';
import * as XLSX from 'xlsx';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { hubId } = await params;

    // Verify hub exists
    const hub = await Hub.findById(hubId);
    if (!hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' 
      }, { status: 400 });
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length < 2) {
      return NextResponse.json({ 
        error: 'Excel file must contain at least a header row and one data row' 
      }, { status: 400 });
    }

    // Extract headers and validate
    const headers = data[0] as string[];
    const expectedHeaders = [
      'Date', 'Hub Name', 'Client', 'Inbound', 'Outbound', 'Backlogs', 
      'Delivered', 'Failed', 'Misroutes', 'Trips - 2W', 'Trips - 3W', 
      'Trips - 4W', 'Successful Deliveries - 2W', 'Successful Deliveries - 3W', 
      'Successful Deliveries - 4W', 'Attendance - Hub Lead', 'Attendance - Backroom',
      'Failed Deliveries - Canceled Before Delivery', 'Failed Deliveries - No Cash Available',
      'Failed Deliveries - Postpone', 'Failed Deliveries - Not at Home',
      'Failed Deliveries - Refuse', 'Failed Deliveries - Unreachable',
      'Failed Deliveries - Invalid Address'
    ];

    // Check if headers match (allow some flexibility)
    const headerMismatch = expectedHeaders.some(expected => 
      !headers.some(header => header && header.toLowerCase().includes(expected.toLowerCase().split(' - ')[0]))
    );

    if (headerMismatch) {
      return NextResponse.json({ 
        error: 'Excel file headers do not match the expected template. Please use the generated template.' 
      }, { status: 400 });
    }

    // Process data rows
    const reports = [];
    const errors = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || cell === '')) {
        continue;
      }

      try {
        // Extract data from row
        const date = row[0];
        const hubName = row[1];
        const client = row[2];
        const inbound = parseInt(row[3]) || 0;
        const outbound = parseInt(row[4]) || 0;
        const backlogs = parseInt(row[5]) || 0;
        const delivered = parseInt(row[6]) || 0;
        const failed = parseInt(row[7]) || 0;
        const misroutes = parseInt(row[8]) || 0;
        const trips2w = parseInt(row[9]) || 0;
        const trips3w = parseInt(row[10]) || 0;
        const trips4w = parseInt(row[11]) || 0;
        const successDeliveries2w = parseInt(row[12]) || 0;
        const successDeliveries3w = parseInt(row[13]) || 0;
        const successDeliveries4w = parseInt(row[14]) || 0;
        const attendanceHubLead = parseInt(row[15]) || 0;
        const attendanceBackroom = parseInt(row[16]) || 0;
        const failedCanceled = parseInt(row[17]) || 0;
        const failedNoCash = parseInt(row[18]) || 0;
        const failedPostpone = parseInt(row[19]) || 0;
        const failedNotHome = parseInt(row[20]) || 0;
        const failedRefuse = parseInt(row[21]) || 0;
        const failedUnreachable = parseInt(row[22]) || 0;
        const failedInvalidAddress = parseInt(row[23]) || 0;

        // Validate date
        let reportDate;
        if (date instanceof Date) {
          reportDate = date;
        } else if (typeof date === 'string') {
          reportDate = new Date(date);
        } else if (typeof date === 'number') {
          // Excel date number
          reportDate = new Date((date - 25569) * 86400 * 1000);
        } else {
          throw new Error('Invalid date format');
        }

        if (isNaN(reportDate.getTime())) {
          throw new Error('Invalid date format');
        }

        // Check if report already exists for this date
        const existingReport = await Report.findOne({
          hub: hubId,
          date: {
            $gte: new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate()),
            $lt: new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate() + 1)
          }
        });

        if (existingReport) {
          errors.push(`Row ${i + 1}: Report already exists for date ${reportDate.toDateString()}`);
          continue;
        }

        // Create report data
        const reportData = {
          hub: hubId,
          date: reportDate,
          inbound,
          outbound,
          backlogs,
          delivered,
          failed,
          misroutes,
          trips: {
            '2w': trips2w,
            '3w': trips3w,
            '4w': trips4w
          },
          successful_deliveries: {
            '2w': successDeliveries2w,
            '3w': successDeliveries3w,
            '4w': successDeliveries4w
          },
          attendance: {
            hub_lead: attendanceHubLead,
            backroom: attendanceBackroom
          }
        };

        // Create failed deliveries data
        const failedDeliveriesData = {
          canceled_bef_delivery: failedCanceled,
          no_cash_available: failedNoCash,
          postpone: failedPostpone,
          not_at_home: failedNotHome,
          refuse: failedRefuse,
          unreachable: failedUnreachable,
          invalid_address: failedInvalidAddress
        };

        reports.push({ reportData, failedDeliveriesData });

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data format'}`);
      }
    }

    if (reports.length === 0) {
      return NextResponse.json({ 
        error: 'No valid reports found in the Excel file',
        details: errors
      }, { status: 400 });
    }

    // Save reports to database
    const savedReports = [];
    const saveErrors = [];

    for (const { reportData, failedDeliveriesData } of reports) {
      try {
        // Create and save report
        const report = new Report(reportData);
        const savedReport = await report.save();

        // Create and save failed deliveries
        const failedDelivery = new FailedDelivery({
          report: savedReport._id,
          ...failedDeliveriesData
        });
        await failedDelivery.save();

        savedReports.push(savedReport);
      } catch (error) {
        saveErrors.push(`Failed to save report for ${reportData.date.toDateString()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${savedReports.length} reports`,
      imported: savedReports.length,
      errors: [...errors, ...saveErrors],
      reports: savedReports
    });

  } catch (error) {
    console.error('Error processing Excel upload:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}
