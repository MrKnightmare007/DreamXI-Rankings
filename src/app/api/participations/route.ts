import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define validation schema for participation data
const participationSchema = z.object({
  matchId: z.string(),
  points: z.number().min(0).max(1000),
  captainName: z.string().min(1),
  viceCaptainName: z.string().min(1),
  teamScreenshot: z.string().url().optional().or(z.string().length(0))
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request data
    const result = participationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { matchId, points, captainName, viceCaptainName, teamScreenshot } = result.data;
    
    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });
    
    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }
    
    // Check if match is completed
    if (match.isCompleted) {
      return NextResponse.json(
        { message: 'Cannot participate in a completed match' },
        { status: 400 }
      );
    }
    
    // Check if user has already participated
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId
        }
      }
    });
    
    if (existingParticipation) {
      return NextResponse.json(
        { message: 'You have already participated in this match' },
        { status: 409 }
      );
    }
    
    // Create participation record
    const participation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        matchId,
        points,
        captainName,
        viceCaptainName,
        teamScreenshot: teamScreenshot || null
      }
    });
    
    return NextResponse.json(
      { message: 'Participation recorded successfully', participation },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error recording participation:', error);
    return NextResponse.json(
      { message: 'An error occurred while recording participation' },
      { status: 500 }
    );
  }
}