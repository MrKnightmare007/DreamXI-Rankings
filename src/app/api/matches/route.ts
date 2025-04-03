import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getAuthSession();
    
    // Fetch matches from database
    const dbMatches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        winningTeam: true,
        participations: session ? {
          where: {
            userId: session.user.id
          },
          take: 1
        } : false
      },
      orderBy: {
        matchDate: 'desc'
      }
    });
    
    // Fetch IPL matches from Cricket API
    let cricketApiMatches = [];
    try {
      const cricketApiResponse = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${process.env.CRICKET_API_KEY}&id=d5a498c8-7596-4b93-8ab0-e0efc3345312`, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (cricketApiResponse.ok) {
        const cricketData = await cricketApiResponse.json();
        if (cricketData && cricketData.data && cricketData.data.matchList) {
          cricketApiMatches = cricketData.data.matchList;
        }
      }
    } catch (error) {
      console.error('Error fetching cricket API data:', error);
    }
    
    // Process matches into categories
    const now = new Date();
    
    const upcoming = dbMatches.filter(match => 
      new Date(match.matchDate) > now && !match.isCompleted
    );
    
    // Fetch live matches
    const liveMatches = await prisma.match.findMany({
      where: {
        isLive: true,
        isCompleted: false
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        winningTeam: true,
        participations: session ? {
          where: {
            userId: session.user.id
          }
        } : false
      },
      orderBy: {
        matchDate: 'asc'
      }
    });
    
    const live = dbMatches.filter(match => {
      const matchDate = new Date(match.matchDate);
      const matchEndTime = new Date(matchDate.getTime() + 4 * 60 * 60 * 1000); // Assuming 4 hours for a match
      return matchDate <= now && matchEndTime >= now && !match.isCompleted;
    });
    
    const completed = dbMatches.filter(match => 
      match.isCompleted
    );
    
    // Return categorized matches
    return NextResponse.json({
      success: true,
      data: {
        upcoming,
        live,
        completed,
        cricketApi: {
          live: cricketApiMatches.filter(match => match.matchStarted === true && match.matchEnded === false),
          upcoming: cricketApiMatches.filter(match => match.matchStarted === false),
          completed: cricketApiMatches.filter(match => match.matchEnded === true)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch matches', error: String(error) },
      { status: 500 }
    );
  }
}