import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../auth/[...nextauth]/route';

export async function POST(
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
    
    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });
    
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId }
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if participation already exists
    const existingParticipation = await prisma.participation.findFirst({
      where: {
        matchId: matchId,
        userId: data.userId
      }
    });
    
    if (existingParticipation) {
      return NextResponse.json(
        { success: false, message: 'User already participating in this match' },
        { status: 400 }
      );
    }
    
    // Create new participation
    const newParticipation = await prisma.participation.create({
      data: {
        matchId: matchId,
        userId: data.userId,
        points: data.points || 0
      }
    });
    
    // Update user's skillScore when adding a new participation
    if (data.points > 0) {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          skillScore: {
            increment: data.points
          }
        }
      });
      
      console.log(`Increased user ${data.userId} skillScore by ${data.points}`);
    }
    
    return NextResponse.json({
      success: true,
      data: newParticipation
    });
  } catch (error) {
    console.error('Error adding participation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add participation',
        error: error.message
      },
      { status: 500 }
    );
  }
}