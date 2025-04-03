import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../auth/[...nextauth]/route';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Make sure to await params or destructure it properly
    const participationId = params.id;
    const data = await request.json();
    
    // Check if participation exists
    const participation = await prisma.participation.findUnique({
      where: { id: participationId }
    });
    
    if (!participation) {
      return NextResponse.json(
        { success: false, message: 'Participation not found' },
        { status: 404 }
      );
    }
    
    // Update participation
    const updatedParticipation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        points: data.points
      }
    });
    
    // Update user's skillScore by adding the points difference
    const pointsDifference = data.points - participation.points;
    if (pointsDifference !== 0) {
      // First get the current user to ensure we have the latest skillScore
      const participantUser = await prisma.user.findUnique({
        where: { id: participation.userId },
        select: { skillScore: true }
      });
      
      // Then update with the new total
      await prisma.user.update({
        where: { id: participation.userId },
        data: {
          skillScore: participantUser.skillScore + pointsDifference
        }
      });
      
      console.log(`Updated user ${participation.userId} skillScore by ${pointsDifference}`);
    }
    
    return NextResponse.json({
      success: true,
      data: updatedParticipation
    });
  } catch (error) {
    console.error('Error updating participation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update participation',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Make sure to await params or destructure it properly
    const participationId = params.id;
    
    // Check if participation exists
    const participation = await prisma.participation.findUnique({
      where: { id: participationId }
    });
    
    if (!participation) {
      return NextResponse.json(
        { success: false, message: 'Participation not found' },
        { status: 404 }
      );
    }
    
    // Delete participation
    await prisma.participation.delete({
      where: { id: participationId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Participation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting participation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete participation',
        error: error.message
      },
      { status: 500 }
    );
  }
}