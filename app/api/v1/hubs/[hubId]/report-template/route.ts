import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Hub from '@/models/Hubs';
import * as XLSX from 'xlsx';

export async function GET(
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

    // Fetch hub information
    const hub = await Hub.findById(hubId);
    if (!hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Define the headers for the report template
    const headers = [
      'Date',
      'Hub Name',
      'Client',
      'Inbound',
      'Outbound', 
      'Backlogs',
      'Delivered',
      'Failed',
      'Misroutes',
      'Trips - 2W',
      'Trips - 3W',
      'Trips - 4W',
      'Successful Deliveries - 2W',
      'Successful Deliveries - 3W', 
      'Successful Deliveries - 4W',
      'Attendance - Hub Lead',
      'Attendance - Backroom',
      'Failed Deliveries - Canceled Before Delivery',
      'Failed Deliveries - No Cash Available',
      'Failed Deliveries - Postpone',
      'Failed Deliveries - Not at Home',
      'Failed Deliveries - Refuse',
      'Failed Deliveries - Unreachable',
      'Failed Deliveries - Invalid Address'
    ];

    // Create worksheet data with headers and some sample rows
    const worksheetData = [
      headers,
      // Add a few sample rows with the current date and hub info
      [
        new Date().toISOString().split('T')[0], // Current date
        hub.name,
        hub.client,
        '', // Inbound - to be filled
        '', // Outbound - to be filled
        '', // Backlogs - to be filled
        '', // Delivered - to be filled
        '', // Failed - to be filled
        '', // Misroutes - to be filled
        '', // Trips 2W - to be filled
        '', // Trips 3W - to be filled
        '', // Trips 4W - to be filled
        '', // Successful Deliveries 2W - to be filled
        '', // Successful Deliveries 3W - to be filled
        '', // Successful Deliveries 4W - to be filled
        '', // Attendance Hub Lead - to be filled
        '', // Attendance Backroom - to be filled
        '', // Failed Deliveries - Canceled Before Delivery - to be filled
        '', // Failed Deliveries - No Cash Available - to be filled
        '', // Failed Deliveries - Postpone - to be filled
        '', // Failed Deliveries - Not at Home - to be filled
        '', // Failed Deliveries - Refuse - to be filled
        '', // Failed Deliveries - Unreachable - to be filled
        '', // Failed Deliveries - Invalid Address - to be filled
      ],
      // Add a few more empty rows for multiple days
      ...Array.from({ length: 10 }, (_, i) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i + 1);
        return [
          futureDate.toISOString().split('T')[0],
          hub.name,
          hub.client,
          ...Array(21).fill('') // Empty cells for all other columns
        ];
      })
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Hub Name
      { wch: 15 }, // Client
      { wch: 10 }, // Inbound
      { wch: 10 }, // Outbound
      { wch: 10 }, // Backlogs
      { wch: 10 }, // Delivered
      { wch: 10 }, // Failed
      { wch: 10 }, // Misroutes
      { wch: 12 }, // Trips 2W
      { wch: 12 }, // Trips 3W
      { wch: 12 }, // Trips 4W
      { wch: 18 }, // Successful Deliveries 2W
      { wch: 18 }, // Successful Deliveries 3W
      { wch: 18 }, // Successful Deliveries 4W
      { wch: 18 }, // Attendance Hub Lead
      { wch: 18 }, // Attendance Backroom
      { wch: 25 }, // Failed Deliveries - Canceled Before Delivery
      { wch: 25 }, // Failed Deliveries - No Cash Available
      { wch: 25 }, // Failed Deliveries - Postpone
      { wch: 25 }, // Failed Deliveries - Not at Home
      { wch: 25 }, // Failed Deliveries - Refuse
      { wch: 25 }, // Failed Deliveries - Unreachable
      { wch: 25 }, // Failed Deliveries - Invalid Address
    ];
    worksheet['!cols'] = columnWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2563EB' } }, // Blue background
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Reports Template');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Create filename with hub name and current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${hub.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_Template_${currentDate}.xlsx`;

    // Return the file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating report template:', error);
    return NextResponse.json(
      { error: 'Failed to generate report template' },
      { status: 500 }
    );
  }
}
