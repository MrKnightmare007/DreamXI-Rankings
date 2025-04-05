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
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // First, get the participation details before deleting
    const participation = await prisma.participation.findUnique({
      where: { id },
      select: {
        userId: true,
        moneySpent: true,
        moneyGained: true
      }
    });

    if (!participation) {
      return new Response(JSON.stringify({ error: 'Participation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the participation
    await prisma.participation.delete({
      where: { id }
    });

    // Update user stats after deletion
    // We need to subtract the money values that were added when this participation was created
    await updateUserStatsAfterDeletion(
      participation.userId, 
      participation.moneySpent || 0, 
      participation.moneyGained || 0
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting participation:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete participation', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Add this function to update user stats after deletion
async function updateUserStatsAfterDeletion(userId: string, moneySpent: number, moneyGained: number) {
  // Get all remaining participations for this user
  const participations = await prisma.participation.findMany({
    where: { userId }
  });
  
  // Recalculate skill score
  let skillScore = 0;
  
  if (participations.length > 0) {
    // Sum of all points
    const totalPoints = participations.reduce((sum, p) => sum + p.points, 0);
    
    // Base skill score is average points
    skillScore = Math.round(totalPoints / participations.length);
  }
  
  // Get current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalMoneyGained: true, totalMoneyLost: true }
  });
  
  // Update user's stats - subtract the money values from the deleted participation
  await prisma.user.update({
    where: { id: userId },
    data: {
      skillScore,
      totalMoneyGained: Math.max(0, (user?.totalMoneyGained || 0) - moneyGained),
      totalMoneyLost: Math.max(0, (user?.totalMoneyLost || 0) - moneySpent)
    }
  });
}