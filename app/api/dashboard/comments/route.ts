import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import DashboardComment from '@/models/Dashboard_Comments';
import Hub_Comments from '@/models/Hub_Comments';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    console.log(searchParams)
    const dashboardType = searchParams.get('type') || 'analytics';
    const hubId = searchParams.get('hub_id') || 'all';
    let latestComment;
    if (dashboardType === 'main') {
      latestComment = await DashboardComment
        .findOne({ dashboard_type: dashboardType })
        .sort({ createdAt: -1 })
        .populate('user_id', 'name email')
        .lean();
    } else {
      latestComment = await Hub_Comments
        .findOne({ hub_id: hubId })
        .sort({ createdAt: -1 })
        .populate('user_id', 'name email')
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: latestComment
    });
  } catch (error) {
    console.error('Error fetching dashboard comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comment, dashboard_type = 'analytics' } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment is required' },
        { status: 400 }
      );
    }

    const newComment = new DashboardComment({
      user_id: session.user.id,
      comment: comment.trim(),
      dashboard_type
    });

    await newComment.save();
    
    // Populate user data before returning
    await newComment.populate('user_id', 'name email');

    return NextResponse.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error creating dashboard comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dashboard comment' },
      { status: 500 }
    );
  }
}
