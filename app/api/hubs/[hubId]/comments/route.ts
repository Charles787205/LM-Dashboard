import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import HubComment from '@/models/Hub_Comments';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    await connectDB();
    
    const { hubId } = await params;
    
    // Get latest comment for the hub
    const latestComment = await HubComment
      .findOne({ hub_id: hubId })
      .sort({ createdAt: -1 })
      .populate('user_id', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: latestComment
    });
  } catch (error) {
    console.error('Error fetching hub comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hub comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hubId: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { hubId } = await params;
    const body = await request.json();
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment is required' },
        { status: 400 }
      );
    }

    const newComment = new HubComment({
      hub_id: hubId,
      user_id: session.user.id,
      comment: comment.trim()
    });

    await newComment.save();
    
    // Populate user data before returning
    await newComment.populate('user_id', 'name email');

    return NextResponse.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error creating hub comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hub comment' },
      { status: 500 }
    );
  }
}
