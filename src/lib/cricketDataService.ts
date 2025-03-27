import { Match } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import cuid from 'cuid';

export interface CricketMatch {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  dateTimeGMT: string;
  team1: string;
  team2: string;
  teamInfo: Array<{ name: string; img: string }>;
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
      signal: controller.signal,
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
        body: errorBody,
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response structure');
    }

    // Validate each match structure
    const validMatches = data.data.filter(
      (m) => m.teamInfo && Array.isArray(m.teamInfo) && m.teamInfo.length >= 2
    );
    if (validMatches.length < data.data.length) {
      console.warn(
        'Filtered',
        data.data.length - validMatches.length,
        'matches with incomplete team data'
      );
    }

    try {
      return data.data.map((match: any) => ({
        team1: ((match.teams?.[0] || 'Team 1').trim().replace(/[\s-]+/g, '') || 'team1').toLowerCase(),
        team2: ((match.teams?.[1] || 'Team 2').trim().replace(/[\s-]+/g, '') || 'team2').toLowerCase(),
        teamInfo:
          Array.isArray(match.teamInfo) && match.teamInfo.length >= 2
            ? match.teamInfo
            : [
                { name: (Array.isArray(match.teams) && match.teams[0]) || 'Team 1', img: '' },
                { name: (Array.isArray(match.teams) && match.teams[1]) || 'Team 2', img: '' },
              ],
        id: match.id,
        matchNumber: parseInt(match.name.match(/\d+/)?.[0] || '0'),
        date: match.date.split('T')[0],
        dateTimeGMT: match.dateTimeGMT,
        time: match.dateTimeGMT
          ? new Date(match.dateTimeGMT).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        status: (match.status || '').toLowerCase().includes('live')
          ? 'live'
          : (match.status || '').toLowerCase().includes('completed')
          ? 'completed'
          : 'upcoming',
        result: (match.status || '').includes('won')
          ? {
              winner: match.teams?.find((t) => match.status.includes(t)) || match.status.split(' ')[0],
              winByRuns: match.team1 && match.team2
                ? match.score.find((s: any) => s.inning.includes(match.team1))?.r -
                  match.score.find((s: any) => s.inning.includes(match.team2))?.r
                : 0,
              winByWickets: match.team1 && match.team2
                ? 10 - (match.score.find((s: any) => s.inning.includes(match.team2))?.w || 0)
                : 0,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Data mapping error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        rawMatch: data?.data?.[0],
      });
      throw error;
    }
  } catch (error) {
    console.error('Network error fetching matches:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error('Failed to fetch live match data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function syncLiveMatchesWithDB(): Promise<Match[]> {
  try {
    const liveMatches = await fetchLiveMatches();

    // Define IPL teams (normalized names)
    const iplTeams = [
      'chennaisuperkings', 'mumbaiindians', 'royalchallengersbangalore',
      'kolkataknightriders', 'delhicapitals', 'punjabkings',
      'rajasthanroyals', 'sunrisershyderabad', 'gujarattitans', 'lucknowsupergiants',
    ];

    // Filter for IPL matches
    const iplMatches = liveMatches.filter((match) => {
      const team1 = match.team1.replace(/[\s-]+/g, '').toLowerCase();
      const team2 = match.team2.replace(/[\s-]+/g, '').toLowerCase();
      return iplTeams.includes(team1) && iplTeams.includes(team2);
    });
    console.log(`Filtered ${liveMatches.length - iplMatches.length} non-IPL matches`);

    const processedMatches = [];
    const errorMatches = [];

    // Pre-process teams
    for (const match of iplMatches) {
      try {
        if (!match.teamInfo?.length || match.teamInfo.length < 2) {
          errorMatches.push({ matchId: match.id, error: 'Missing team info' });
          continue;
        }

        const dbTeam1 = match.team1.replace(/[\s-]+/g, '').toLowerCase();
        const dbTeam2 = match.team2.replace(/[\s-]+/g, '').toLowerCase();
        const team1Info = match.teamInfo.find((t) => t.name === match.team1) || {};
        const team2Info = match.teamInfo.find((t) => t.name === match.team2) || {};

        await prisma.team.upsert({
          where: { name: dbTeam1 },
          create: {
            id: cuid(), // Use imported cuid
            name: dbTeam1,
            shortName: team1Info.shortName || dbTeam1.substring(0, 3).toUpperCase(),
            logoUrl: team1Info.img || '/default-team-logo.png',
            establishedYear: 2008,
          },
          update: { logoUrl: team1Info.img || '' },
        });

        await prisma.team.upsert({
          where: { name: dbTeam2 },
          create: {
            id: cuid(), // Use imported cuid
            name: dbTeam2,
            shortName: team2Info.shortName || dbTeam2.substring(0, 3).toUpperCase(),
            logoUrl: team2Info.img || '/default-team-logo.png',
            establishedYear: 2008,
          },
          update: { logoUrl: team2Info.img || '' },
        });

        const matchRecord = await prisma.match.upsert({
          where: { id: match.id },
          create: {
            id: match.id,
            matchNumber: match.matchNumber,
            matchDate: (() => {
              const date = new Date(match.dateTimeGMT);
              return isNaN(date.getTime()) ? new Date() : date;
            })(),
            season: 2025,
            homeTeam: { connect: { name: dbTeam1 } },
            awayTeam: { connect: { name: dbTeam2 } },
            isCompleted: match.status === 'completed',
            winningTeamId: match.result?.winner
              ? (await prisma.team.findUnique({ where: { name: match.result.winner } }))?.id
              : undefined,
            winByRuns: match.result?.winByRuns,
            winByWickets: match.result?.winByWickets,
          },
          update: {
            matchDate: (() => {
              const date = new Date(match.dateTimeGMT);
              return isNaN(date.getTime()) ? new Date() : date;
            })(),
            isCompleted: match.status === 'completed',
            winningTeamId: match.result?.winner
              ? (await prisma.team.findUnique({ where: { name: match.result.winner } }))?.id
              : undefined,
            winByRuns: match.result?.winByRuns,
            winByWickets: match.result?.winByWickets,
          },
        });
        processedMatches.push(matchRecord);
      } catch (error) {
        console.error('Skipping match due to error:', {
          matchId: match.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          teams: [match.team1, match.team2],
        });
        errorMatches.push({ matchId: match.id });
      }
    }

    console.log(`Successfully processed ${processedMatches.length} IPL matches`);
    return processedMatches;
  } catch (error) {
    console.error('Sync failed:', error);
    throw new Error('Database sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}