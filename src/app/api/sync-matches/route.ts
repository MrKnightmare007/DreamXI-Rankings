import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get all completed matches that need processing
    const completedMatches = await prisma.match.findMany({
      where: {
        isCompleted: true,
      },
      include: {
        participations: {
          include: {
            user: true
          }
        },
        homeTeam: true,
        awayTeam: true
      }
    });

    // Process each match
    for (const match of completedMatches) {
      console.log(`Processing match: ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`);
      
      // Filter out admin users from participations when processing
      const nonAdminParticipations = match.participations.filter(
        participation => participation.user.role !== 'ADMIN'
      );
      
      // Process only non-admin participations
      // You can add additional logic here if needed
    }

    // You could also fetch external data here if needed
    // For example, from a cricket API to update match results

    return NextResponse.json({
      success: true,
      message: 'Matches synced successfully',
      processedMatches: completedMatches.length
    });
  } catch (error) {
    console.error('Error syncing matches:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync matches',
        error: error.message
      },
      { status: 500 }
    );
  }
}



// Rename GET to something else like syncMatchesHandler
export async function GET(request: Request) {
  try {
    // Fetch cricket API data
    const cricketApiResponse = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${process.env.CRICKET_API_KEY}&id=d5a498c8-7596-4b93-8ab0-e0efc3345312`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!cricketApiResponse.ok) {
      throw new Error(`Cricket API responded with status: ${cricketApiResponse.status}`);
    }
    
    const cricketData = await cricketApiResponse.json();
    
    if (!cricketData?.data?.matchList) {
      throw new Error('Invalid data structure from Cricket API');
    }
    
    const allMatches = cricketData.data.matchList || [];
    let syncedCount = 0;
    
    // Process each match
    for (const apiMatch of allMatches) {
      // Skip if no match ID
      if (!apiMatch.id) continue;
      
      // Extract team names
      const teamNames = apiMatch.teams || [];
      if (teamNames.length < 2) continue; // Skip if we don't have both teams
      
      // Find or create teams
      const homeTeam = await findOrCreateTeam(teamNames[0]);
      const awayTeam = await findOrCreateTeam(teamNames[1]);
      
      // Extract match number from name (e.g., "3rd Match")
      const matchNumberMatch = apiMatch.name?.match(/(\d+)(st|nd|rd|th) Match/);
      const matchNumber = matchNumberMatch ? parseInt(matchNumberMatch[1], 10) : 0;
      
      // Determine match status
      const isCompleted = apiMatch.matchEnded === true;
      const isLive = apiMatch.matchStarted === true && apiMatch.matchEnded === false;
      
      // Prepare match data
      const matchData = {
        matchNumber,
        season: 2025, // Adjust as needed
        matchDate: new Date(apiMatch.dateTimeGMT),
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        isCompleted,
        isLive, // Add isLive field
        venue: apiMatch.venue,
      };
      
      // If match is completed, try to determine winner
      if (isCompleted && apiMatch.status) {
        // Try to extract winning team from status
        const homeTeamWon = apiMatch.status.includes(homeTeam.name) || 
                           apiMatch.status.includes(homeTeam.shortName);
        const awayTeamWon = apiMatch.status.includes(awayTeam.name) || 
                           apiMatch.status.includes(awayTeam.shortName);
        
        // Improved win margin extraction
        const runWinMatch = apiMatch.status.match(/won by (\d+) runs?/i);
        const wicketWinMatch = apiMatch.status.match(/won by (\d+) wkts?/i) || 
                             apiMatch.status.match(/won by (\d+) wickets?/i);
        
        if (homeTeamWon) {
          matchData.winningTeamId = homeTeam.id;
          
          if (runWinMatch) {
            matchData.winByRuns = parseInt(runWinMatch[1], 10);
          } else if (wicketWinMatch) {
            matchData.winByWickets = parseInt(wicketWinMatch[1], 10);
          }
        } else if (awayTeamWon) {
          matchData.winningTeamId = awayTeam.id;
          
          if (runWinMatch) {
            matchData.winByRuns = parseInt(runWinMatch[1], 10);
          } else if (wicketWinMatch) {
            matchData.winByWickets = parseInt(wicketWinMatch[1], 10);
          }
        }
      }
      
      // Check if match already exists in our database by matchNumber and season
      const existingMatch = await prisma.match.findFirst({
        where: { 
          matchNumber: matchData.matchNumber,
          season: matchData.season
        }
      });
      
      // Update or create match in database
      if (existingMatch) {
        await prisma.match.update({
          where: { id: existingMatch.id },
          data: matchData
        });
      } else {
        await prisma.match.create({
          data: matchData
        });
      }
      
      syncedCount++;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${syncedCount} matches` 
    });
  } catch (error) {
    console.error('Error syncing matches:', error);
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}

// Helper function to find or create a team
async function findOrCreateTeam(teamName) {
  // Try to find team by name
  let team = await prisma.team.findFirst({
    where: {
      OR: [
        { name: teamName },
        { shortName: teamName }
      ]
    }
  });
  
  // If team doesn't exist, create it
  if (!team) {
    // Create a short name from the team name
    const shortName = teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    
    team = await prisma.team.create({
      data: {
        name: teamName,
        shortName: shortName,
        establishedYear: 2008, // Default for IPL teams
      }
    });
  }
  
  return team;
}