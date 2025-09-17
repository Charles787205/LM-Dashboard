import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/models/Users';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const user = await User.findById(id).select('-__v').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      role,
      position,
      hubId,
      hubName,
      status,
      employeeId,
      totalDeliveries,
      successfulDeliveries,
      rating
    } = body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is unique (if changed)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Check if employee ID is unique (if changed)
    if (employeeId && employeeId !== existingUser.employeeId) {
      const employeeExists = await User.findOne({ 
        employeeId, 
        _id: { $ne: id } 
      });
      if (employeeExists) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        role,
        position,
        hubId: hubId === '' ? null : hubId,
        hubName,
        status,
        employeeId,
        totalDeliveries,
        successfulDeliveries,
        rating,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-__v');

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Instead of deleting, we could deactivate the user
    // This is safer for data integrity
    await User.findByIdAndUpdate(
      id,
      { 
        status: 'inactive',
        updatedAt: new Date()
      }
    );

    return NextResponse.json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
