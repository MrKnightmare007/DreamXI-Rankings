import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    
    // Get current date
    const now = new Date();
    
    // Fetch all matches for the current season
    const matches = await prisma.match.findMany({
      where: {
        season: 2025, // Current IPL season
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        winningTeam: true,
        participations: session ? {
          where: { userId: session.user.id },
          select: { points: true, rank: true }
        } : false
      },
      orderBy: {
        matchDate: 'asc'
      }
    });

    // Separate matches into current/upcoming and completed
    const currentAndUpcomingMatches = matches.filter(match => 
      new Date(match.matchDate) >= now || !match.isCompleted
    );
    
    const completedMatches = matches.filter(match => 
      new Date(match.matchDate) < now && match.isCompleted
    );

    return NextResponse.json({
      currentAndUpcomingMatches,
      completedMatches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching matches' },
      { status: 500 }
    );
  }
}