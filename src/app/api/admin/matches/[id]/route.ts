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
    
    const matchId = params.id;
    const data = await request.json();
    
    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        winningTeamId: data.winningTeamId || null,
        winByRuns: data.winByRuns || 0,
        winByWickets: data.winByWickets || 0,
        isCompleted: data.isCompleted || false
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedMatch
    });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update match',
        error: error.message
      },
      { status: 500 }
    );
  }
}