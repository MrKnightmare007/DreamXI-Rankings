import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    const matchId = params.id;

    // Fetch match details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        winningTeam: true,
        participations: session ? {
          where: { userId: session.user.id },
          select: {
            id: true,
            points: true,
            rank: true,
            captainName: true,
            viceCaptainName: true,
            teamScreenshot: true
          }
        } : false
      }
    });

    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    // Add user participation info if available
    const userParticipation = session && match.participations.length > 0 
      ? match.participations[0] 
      : null;

    return NextResponse.json({
      ...match,
      userParticipation
    });
  } catch (error) {
    console.error('Error fetching match details:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching match details' },
      { status: 500 }
    );
  }
}