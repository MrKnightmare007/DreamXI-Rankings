import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { syncLiveMatchesWithDB } from '@/lib/cricketDataService';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    
    let syncResult;
    let syncError = null;
    try {
      syncResult = await syncLiveMatchesWithDB();
      console.log('Successfully processed', syncResult.length, 'matches');
    } catch (error) {
      syncError = error;
      console.error('Sync error:', error);
    }
    
    const now = new Date();
    console.log('Current date:', now.toISOString());

    const matches = await prisma.match.findMany({
      where: { season: 2025 },
      include: {
        homeTeam: true,
        awayTeam: true,
        winningTeam: true,
        participations: session ? {
          where: { userId: session.user.id },
          select: { id: true, points: true, rank: true }
        } : false
      },
      orderBy: { matchDate: 'asc' }
    });

    console.log('Raw matches from DB:', matches.map(m => ({
      id: m.id,
      matchDate: m.matchDate.toISOString(),
      isCompleted: m.isCompleted,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
    })));

    const upcoming = matches.filter(m => 
      !m.isCompleted && new Date(m.matchDate) > now
    );
    
    // Widen the live window for testing (e.g., 48 hours)
    const live = matches.filter(m =>
      !m.isCompleted && 
      new Date(m.matchDate) <= now && 
      new Date(m.matchDate) >= new Date(now.getTime() - 48 * 60 * 60 * 1000)
    );

    const completed = matches.filter(m => m.isCompleted);

    console.log('Filtered matches:', {
      upcoming: upcoming.map(m => ({ id: m.id, matchDate: m.matchDate.toISOString() })),
      live: live.map(m => ({ id: m.id, matchDate: m.matchDate.toISOString() })),
      completed: completed.map(m => ({ id: m.id, matchDate: m.matchDate.toISOString() })),
    });

    return NextResponse.json({
      success: true,
      data: { upcoming, live, completed },
      syncStatus: {
        processed: syncResult?.length || 0,
        errors: syncError ? 1 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({
      success: false,
      data: { upcoming: [], live: [], completed: [] },
      message: (error instanceof Error ? error.message : 'An error occurred while fetching matches') + ' - ' + new Date().toISOString()
    }, { status: 500 });
  }
}