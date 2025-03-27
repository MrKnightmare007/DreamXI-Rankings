import { NextResponse } from 'next/server';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { syncLiveMatchesWithDB } from '@/lib/cricketDataService';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    
    // Sync with external cricket API
    let syncResult;
    let syncError = null;
    try {
      syncResult = await syncLiveMatchesWithDB();
      // Proceed with available matches even if some failed
      console.log('Successfully processed', syncResult.length, 'matches');
    } catch (error) {
      syncError = error;
      console.error('Sync error:', error);
      // Continue with existing matches despite partial sync failure
    }
    
    // Get current date
    // Get current time
    const now = new Date();

    // Fetch and categorize matches
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

    // Categorize matches with precise status detection
    const upcoming = matches.filter(m => 
      !m.isCompleted && new Date(m.matchDate) > now
    );
    
    const live = matches.filter(m =>
      !m.isCompleted && 
      new Date(m.matchDate) <= now && 
      new Date(m.matchDate) >= new Date(now.getTime() - 8 * 60 * 60 * 1000)
    );

    const completed = matches.filter(m => m.isCompleted);

    

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