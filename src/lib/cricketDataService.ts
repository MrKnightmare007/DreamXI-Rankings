import { Match } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface CricketMatch {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  dateTimeGMT: string;
  team1: string;
  team2: string;
  teamInfo: Array<{name: string, img: string}>;
  status: 'upcoming' | 'live' | 'completed';
  result?: {
    winner: string;
    winByRuns?: number;
    winByWickets?: number;
  };
}


const API_KEY = process.env.CRICKET_API_KEY;
const BASE_URL = 'https://api.cricapi.com/v1/currentMatches';

export async function fetchLiveMatches(): Promise<CricketMatch[]> {
  try {
    if (!API_KEY) {
      throw new Error('Cricket API key not configured');
    }


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&offset=0`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.status === 401) {
      throw new Error('Invalid API key - check CRICKET_API_KEY in .env');
    }


    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }


    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response structure');
    }


    // Validate each match structure
    const validMatches = data.data.filter(m => m.teamInfo && Array.isArray(m.teamInfo) && m.teamInfo.length >= 2);
    if (validMatches.length < data.data.length) {
      console.warn('Filtered', data.data.length - validMatches.length, 'matches with incomplete team data');
    }


    try {
      return data.data.map((match: any) => ({ 
      // Map API fields to database schema
      // Convert team names to our database's team naming convention
      team1: ((match.teams?.[0] || 'Team 1').trim().replace(/[\s-]+/g, '') || 'team1').toLowerCase(),
      team2: ((match.teams?.[1] || 'Team 2').trim().replace(/[\s-]+/g, '') || 'team2').toLowerCase(),
      teamInfo: (Array.isArray(match.teamInfo) && match.teamInfo.length >= 2) ? match.teamInfo : [
        { name: (Array.isArray(match.teams) && match.teams[0]) || 'Team 1', img: '' },
        { name: (Array.isArray(match.teams) && match.teams[1]) || 'Team 2', img: '' }
      ],
      id: match.id,
      matchNumber: parseInt(match.name.match(/\d+/)?.[0] || '0'),
      date: match.date.split('T')[0],
      dateTimeGMT: match.dateTimeGMT,
      time: match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleTimeString() : new Date().toLocaleTimeString(),
      status: (match.status || '').toLowerCase().includes('live') ? 'live' : (match.status || '').toLowerCase().includes('completed') ? 'completed' : 'upcoming',
      result: (match.status || '').includes('won') ? {
        winner: match.teams?.find(t => match.status.includes(t)) || match.status.split(' ')[0],
        winByRuns: match.team1 && match.team2 ? match.score.find((s: any) => s.inning.includes(match.team1))?.r - match.score.find((s: any) => s.inning.includes(match.team2))?.r : 0,
        winByWickets: match.team1 && match.team2 ? 10 - (match.score.find((s: any) => s.inning.includes(match.team2))?.w || 0) : 0
      } : undefined
    }));
    } catch (error) {
      console.error('Data mapping error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        rawMatch: data?.data?.[0]
      });
      throw error;
    }
  } catch (error) {
    console.error('Network error fetching matches:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Failed to fetch live match data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

}


export async function syncLiveMatchesWithDB(): Promise<Match[]> {
  try {
    const liveMatches = await fetchLiveMatches();

    // Get existing matches from DB
    const existingMatches = await prisma.match.findMany({
      where: { season: 2025 },
      include: { homeTeam: true, awayTeam: true },
    });

    // Increase transaction timeout to 15000ms (15 seconds) to handle the complex operations
    const updatedMatches = await prisma.$transaction(
      async (tx) => {
      try {
        // Validate API response structure
        if (!liveMatches.every((m) => m.team1 && m.team2 && m.id)) {
          throw new Error('Invalid match data structure from API');
        }

        // Process all matches in transaction
        const processedMatches = [];
        const errorMatches = [];

        for (const match of liveMatches) {
          try {
            // Validate teamInfo before processing
            if (!match.teamInfo?.length || match.teamInfo.length < 2) {
              errorMatches.push({ matchId: match.id, error: 'Missing team info' });
              continue;
            }

            // Atomic team creation with fallbacks
            const team1Info = match.teamInfo.find((t) => t.name === match.team1) || {};
            const team2Info = match.teamInfo.find((t) => t.name === match.team2) || {};

            await tx.team.upsert({
              where: { name: match.team1 },
              create: {
                name: match.team1,
                shortName: team1Info.shortName || match.team1.substring(0, 3).toUpperCase(),
                logoUrl: team1Info.img || '/default-team-logo.png',
                establishedYear: 2008,
              },
              update: {
                logoUrl: team1Info.img || '',
              },
            });

            await tx.team.upsert({
              where: { name: match.team2 },
              create: {
                name: match.team2,
                shortName: team2Info.shortName || match.team2.substring(0, 3).toUpperCase(),
                logoUrl: team2Info.img || '',
                establishedYear: 2008,
              },
              update: { logoUrl: team2Info.img || '' },
            });

            // Normalize team names with error handling
            let dbTeam1, dbTeam2;
            try {
              dbTeam1 = match.team1.replace(/[\s-]+/g, '').toLowerCase();
              dbTeam2 = match.team2.replace(/[\s-]+/g, '').toLowerCase();
            } catch (error) {
              console.error('Team name normalization failed:', error);
              throw new Error('Invalid team names in match data');
            }

            // Create/update match record
            const matchRecord = await tx.match.upsert({
              where: { id: match.id },
              create: {
                id: match.id,
                matchNumber: match.matchNumber,
                matchDate: (() => {
                  try {
                    const date = new Date(match.dateTimeGMT);
                    if (!match.dateTimeGMT) {
                      throw new Error('Missing dateTimeGMT for match');
                    }
                    if (isNaN(date.getTime())) {
                      console.warn('Invalid dateTimeGMT:', match.dateTimeGMT);
                      return new Date();
                    }
                    return date;
                  } catch (e) {
                    console.warn('Invalid dateTimeGMT:', match.dateTimeGMT);
                    return new Date();
                  }
                })(),
                season: 2025,
                homeTeam: { connect: { name: dbTeam1 } },
                awayTeam: { connect: { name: dbTeam2 } },
                isCompleted: match.status === 'completed',
                winningTeamId: match.result?.winner
                  ? (await tx.team.findUnique({ where: { name: match.result.winner } }))?.id
                  : undefined,
                winByRuns: match.result?.winByRuns,
                winByWickets: match.result?.winByWickets,
              },
              update: {
                isCompleted: match.status === 'completed',
                winningTeamId: match.result?.winner
                  ? (await tx.team.findUnique({ where: { name: match.result.winner } }))?.id
                  : undefined,
                winByRuns: match.result?.winByRuns,
                winByWickets: match.result?.winByWickets,
              },
            });
            processedMatches.push(matchRecord);
          } catch (matchError) {
            console.error('Skipping match due to error:', {
              matchId: match.id,
              error: matchError instanceof Error ? matchError.message : 'Unknown error',
              teams: [match.team1, match.team2],
            });
            errorMatches.push(match.id);
          }
        }

        // Return processed matches
        return processedMatches.filter(Boolean);
      } catch (error) {
        console.error('Sync transaction failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new Error('Database sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }, {
      timeout: 15000 // Set timeout to 15 seconds (default is 5 seconds)
    }); // <- Properly closed transaction block with timeout configuration

    return updatedMatches;
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Database transaction failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}