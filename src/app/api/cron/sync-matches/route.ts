import { NextResponse } from 'next/server';
import { syncLiveMatchesWithDB } from '@/lib/cricketDataService';

export async function GET() {
  try {
    // Verify cron secret for security
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      throw new Error('CRON_SECRET environment variable not set');
    }

    // Sync matches with external API data
    const syncedMatches = await syncLiveMatchesWithDB();
    
    return NextResponse.json({
      success: true,
      syncedMatches: syncedMatches.length,
      message: 'Successfully synchronized match data'
    });

  } catch (error) {
    console.error('[CRON_SYNC_ERROR]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}