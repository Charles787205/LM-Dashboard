import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Report from '@/models/Reports';

// GET - Fetch reports, optionally filtered by hubId
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId');
    
    let query = {};
    if (hubId) {
      query = { hub: hubId };
    }
    
    const reports = await Report.find(query)
      .sort({ date: -1 })
      .populate('hub', 'name client')
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(reports))
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const report = new Report(body);
    await report.save();
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(JSON.stringify(report))
    });
  } catch (error) {
    console.error('Error creating report:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
