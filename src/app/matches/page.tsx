import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import LiveMatchFromAPI from '@/components/LiveMatchFromAPI';

export default function Page() {
  return (
    <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-700 rounded-lg">Error loading matches</div>}>
      <MatchesContent />
    </ErrorBoundary>
  );
}

async function MatchesContent() {
  const session = await getAuthSession();
  
  // Fetch current, upcoming and completed matches from the API
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/matches`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorData;
    
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = {
        message: `API request failed with status ${response.status} - ${await response.text()}`,
        data: { upcoming: [], live: [], completed: [] }
      };
    }

    if (!errorData.data) {
      console.error('Failed to fetch matches');
      return <div className="p-4 text-red-500">Failed to fetch matches data</div>;
    }
    
    // Use the error data to render a fallback UI instead of returning an object
    const fallbackData = errorData.data || { upcoming: [], live: [], completed: [] };
    console.log('Using fallback data due to API error:', fallbackData);
    
    // Continue with the fallback data
    return renderMatchesContent(fallbackData, session);
  }
  
  const data = await response.json();

  if (!data) return <div>Loading matches...</div>;

  // Check if the response has the expected structure
  if (!data.success && data.message) {
    console.error('API error:', data.message);
    return <div className="p-4 text-red-500">Error loading matches: {data.message}</div>;
  }

  // Handle the nested data structure from the API
  const matchesData = data.data || {};
  
  // Log the actual data structure for debugging
  console.log('API response data structure:', matchesData);
  
  // Ensure all required properties exist with fallbacks
  if (!matchesData.upcoming) matchesData.upcoming = [];
  if (!matchesData.completed) matchesData.completed = [];
  if (!matchesData.live) matchesData.live = [];
  
  // Fetch cricket API data directly
  let cricketApiMatches = {
    upcoming: [],
    live: [],
    completed: []
  };
  
  try {
    // Using cricket API with series_info endpoint to get all IPL matches
    const cricketApiResponse = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${process.env.CRICKET_API_KEY}&id=d5a498c8-7596-4b93-8ab0-e0efc3345312`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (cricketApiResponse.ok) {
      const cricketData = await cricketApiResponse.json();
      console.log('Cricket API series data:', cricketData);
      
      // Process cricket data to categorize matches
      if (cricketData && cricketData.data && cricketData.data.matchList) {
        const allMatches = cricketData.data.matchList || [];
        
        // Filter for live matches (matchStarted is true and matchEnded is false)
        cricketApiMatches.live = allMatches.filter(match => 
          match.matchStarted === true && match.matchEnded === false
        );
        
        // Filter for completed matches (matchEnded is true)
        cricketApiMatches.completed = allMatches.filter(match => 
          match.matchEnded === true
        );
        
        // Filter for upcoming matches (matchStarted is false)
        cricketApiMatches.upcoming = allMatches.filter(match => 
          match.matchStarted === false
        );
        
        console.log('IPL Live matches:', cricketApiMatches.live.length);
        console.log('IPL Completed matches:', cricketApiMatches.completed.length);
        console.log('IPL Upcoming matches:', cricketApiMatches.upcoming.length);
      }
    } else {
      console.error('Failed to fetch cricket data:', cricketApiResponse.statusText);
    }
  } catch (error) {
    console.error('Error fetching cricket data:', error);
  }
  
  // Add cricket API matches to the data
  matchesData.cricketApi = cricketApiMatches;

  return renderMatchesContent(matchesData, session);
}

// Helper function to render matches content with given data
function renderMatchesContent(matchesData: any, session: any) {
  const dbUpcomingMatches = matchesData.upcoming || [];
  const dbCompletedMatches = matchesData.completed || [];
  const dbLiveMatches = matchesData.live || [];
  
  // Cricket API matches
  const cricketApiMatches = matchesData.cricketApi || { upcoming: [], live: [], completed: [] };
  
  // Helper functions for team colors
  const getTeamBgColor = (shortName) => {
    switch(shortName) {
      case 'CSK': return 'bg-yellow-400';
      case 'MI': return 'bg-blue-600';
      case 'RCB': return 'bg-red-600';
      case 'KKR': return 'bg-purple-800';
      case 'DC': return 'bg-blue-500';
      case 'SRH': return 'bg-orange-500';
      case 'PBKS': return 'bg-red-500';
      case 'RR': return 'bg-pink-600';
      case 'GT': return 'bg-blue-700';
      case 'LSG': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getTeamTextColor = (shortName) => {
    switch(shortName) {
      case 'CSK': 
      case 'SRH': return 'text-black';
      default: return 'text-white';
    }
  };
  
  // Combine matches from both sources
  const upcomingMatches = [...dbUpcomingMatches].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
  );
  
  // Sort completed Cricket API matches by match number in descending order
  const sortedCompletedMatches = [...cricketApiMatches.completed].sort((a, b) => {
    // Extract match number from the name (e.g., "3rd Match", "5th Match")
    const getMatchNumber = (name) => {
      const match = name.match(/(\d+)(st|nd|rd|th) Match/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    const numA = getMatchNumber(a.name);
    const numB = getMatchNumber(b.name);
    
    // Sort in descending order (higher match number first)
    return numB - numA;
  });
  
  // Replace the original array with the sorted one
  cricketApiMatches.completed = sortedCompletedMatches;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">IPL 2025 Matches</h1>
      
      {/* Live Matches Section - Now First */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Live Matches</h2>
        
        <div className="space-y-4">
          {dbLiveMatches.length > 0 ? dbLiveMatches.map((match) => (
            <div key={match.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center">
              {/* LIVE indicator in top left */}
              <div className="absolute top-2 left-2">
                <span className="flex items-center px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
                  <span className="animate-pulse mr-1 h-2 w-2 rounded-full bg-white"></span>
                  LIVE
                </span>
              </div>
              
              <div className="flex items-center justify-between w-full pt-6">
                {/* Home Team - Left Side */}
                <div className="flex flex-col items-center w-1/3">
                  <img src={match.homeTeam.logoUrl || '/default-team-logo.png'} alt={match.homeTeam.name} className="w-12 h-12 object-contain" />
                  <p className="text-sm font-medium mt-1">{match.homeTeam.name}</p>
                  <p className="text-xs text-gray-500">{match.homeTeam.shortName}</p>
                </div>
                
                {/* Match Info - Center */}
                <div className="text-center w-1/3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(match.matchDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                  <p className="text-lg font-bold my-1">VS</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(match.matchDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {/* Added venue information */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {match.venue}
                  </p>
                </div>
                
                {/* Away Team - Right Side */}
                <div className="flex flex-col items-center w-1/3">
                  <img src={match.awayTeam.logoUrl || '/default-team-logo.png'} alt={match.awayTeam.name} className="w-12 h-12 object-contain" />
                  <p className="text-sm font-medium mt-1">{match.awayTeam.name}</p>
                  <p className="text-xs text-gray-500">{match.awayTeam.shortName}</p>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <Link 
                  href={`/matches/${match.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          )) : cricketApiMatches.live.length > 0 ? (
            // Use the client component for live matches from Cricket API
            cricketApiMatches.live.map((match) => (
              <LiveMatchFromAPI key={match.id} match={match} />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No live matches at the moment.</p>
          )}
        </div>
      </section>
      
      {/* Upcoming Matches Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Upcoming Matches</h2>
        
        <div className="space-y-4">
          {upcomingMatches.length > 0 ? upcomingMatches.slice(0, 3).map((match) => (
            <div key={match.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Match header with venue */}
              <div className="bg-blue-600 text-white p-2 text-center text-sm">
                {match.homeTeam.name} vs {match.awayTeam.name}, Match #{match.matchNumber || ''}
                <div className="text-xs opacity-80">{match.venue}</div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between w-full">
                  {/* Home Team - Left Side */}
                  <div className="flex flex-col items-center w-1/3">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTeamBgColor(match.homeTeam.shortName)} ${getTeamTextColor(match.homeTeam.shortName)}`}>
                        <span className="font-bold text-lg">{match.homeTeam.shortName}</span>
                      </div>
                      <img 
                        src={match.homeTeam.logoUrl || '/default-team-logo.png'} 
                        alt={match.homeTeam.name} 
                        className="w-8 h-8 object-contain absolute -bottom-1 -right-1 bg-white rounded-md p-1 shadow-md"
                      />
                    </div>
                    <p className="text-sm font-medium mt-2">{match.homeTeam.name}</p>
                  </div>
                  
                  {/* Match Info - Center */}
                  <div className="text-center w-1/3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-xl font-bold my-2">VS</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(match.matchDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {/* Away Team - Right Side */}
                  <div className="flex flex-col items-center w-1/3">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTeamBgColor(match.awayTeam.shortName)} ${getTeamTextColor(match.awayTeam.shortName)}`}>
                        <span className="font-bold text-lg">{match.awayTeam.shortName}</span>
                      </div>
                      <img 
                        src={match.awayTeam.logoUrl || '/default-team-logo.png'} 
                        alt={match.awayTeam.name} 
                        className="w-8 h-8 object-contain absolute -bottom-1 -right-1 bg-white rounded-md p-1 shadow-md"
                      />
                    </div>
                    <p className="text-sm font-medium mt-2">{match.awayTeam.name}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Link 
                    href={`/matches/${match.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-block"
                  >
                    View Match
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming matches scheduled.</p>
          )}
        </div>
      </section>
      
      {/* Completed Matches Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Completed Matches</h2>
        
        <div className="space-y-4">
          {dbCompletedMatches.length > 0 ? dbCompletedMatches.map((match) => {
            // Check if participations array exists and has items before accessing index 0
            const userParticipation = match.participations && match.participations.length > 0 
            ? match.participations[0] 
            : null;
            
            return (
              <div key={match.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Match header with result */}
                <div className="bg-green-600 text-white p-2 text-center text-sm">
                  {match.homeTeam.name} vs {match.awayTeam.name}, Match #{match.matchNumber || ''}
                  <div className="text-xs opacity-80">{match.venue}</div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between w-full">
                    {/* Home Team - Left Side */}
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTeamBgColor(match.homeTeam.shortName)} ${getTeamTextColor(match.homeTeam.shortName)} ${match.winningTeamId === match.homeTeamId ? 'ring-2 ring-green-500' : ''}`}>
                          <span className="font-bold text-lg">{match.homeTeam.shortName}</span>
                        </div>
                        <img 
                          src={match.homeTeam.logoUrl || '/default-team-logo.png'} 
                          alt={match.homeTeam.name} 
                          className="w-8 h-8 object-contain absolute -bottom-1 -right-1 bg-white rounded-md p-1 shadow-md"
                        />
                      </div>
                      <p className={`text-sm font-medium mt-2 ${match.winningTeamId === match.homeTeamId ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                        {match.homeTeam.name}
                      </p>
                    </div>
                    
                    {/* Match Info - Center */}
                    <div className="text-center w-1/3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xl font-bold my-2">VS</p>
                      {match.winningTeam && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {match.winningTeam.name} won
                          {match.winByRuns ? ` by ${match.winByRuns} runs` : ''}
                          {match.winByWickets ? ` by ${match.winByWickets} wickets` : ''}
                        </p>
                      )}
                    </div>
                    
                    {/* Away Team - Right Side */}
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTeamBgColor(match.awayTeam.shortName)} ${getTeamTextColor(match.awayTeam.shortName)} ${match.winningTeamId === match.awayTeamId ? 'ring-2 ring-green-500' : ''}`}>
                          <span className="font-bold text-lg">{match.awayTeam.shortName}</span>
                        </div>
                        <img 
                          src={match.awayTeam.logoUrl || '/default-team-logo.png'} 
                          alt={match.awayTeam.name} 
                          className="w-8 h-8 object-contain absolute -bottom-1 -right-1 bg-white rounded-md p-1 shadow-md"
                        />
                      </div>
                      <p className={`text-sm font-medium mt-2 ${match.winningTeamId === match.awayTeamId ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                        {match.awayTeam.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    {userParticipation && (
                      <div className="text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Your Points</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{userParticipation.points}</p>
                        {userParticipation.rank && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rank: #{userParticipation.rank}</p>
                        )}
                      </div>
                    )}
                    <Link 
                      href={`/matches/${match.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No completed matches yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// REMOVE THIS ENTIRE BLOCK BELOW
// {/* Live Matches */}
// <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
//   <h2 className="text-xl font-bold text-blue-400 mb-4">Live Matches</h2>
//   
//   {liveMatches.length > 0 ? (
//     <div className="space-y-4">
//       {liveMatches.map((match) => (
//         <div key={match.id} className="relative bg-gray-800 rounded-lg p-4 border border-gray-700">
//           <div className="absolute top-2 left-2">
//             <span className="flex items-center px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md">
//               <span className="animate-pulse mr-1 h-2 w-2 rounded-full bg-white"></span>
//               LIVE
//             </span>
//           </div>
//           
//           <div className="flex justify-between items-center">
//             <div className="text-center w-1/4">
//               <img 
//                 src={match.homeTeam.logoUrl || '/default-team-logo.png'} 
//                 alt={match.homeTeam.name} 
//                 className="w-12 h-12 mx-auto object-contain bg-white rounded-full p-1"
//               />
//               <p className="text-sm font-medium mt-2 text-white">{match.homeTeam.shortName}</p>
//             </div>
//             
//             <div className="text-center w-2/4">
//               <p className="text-xs text-gray-400">
//                 {new Date(match.matchDate).toLocaleDateString('en-US', {
//                   month: 'short',
//                   day: 'numeric'
//                 })}
//               </p>
//               <p className="text-lg font-bold my-2 text-white">VS</p>
//               <p className="text-xs text-gray-400">
//                 {new Date(match.matchDate).toLocaleTimeString('en-US', {
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 })}
//               </p>
//               <p className="text-xs text-gray-400 mt-1 truncate">{match.venue}</p>
//             </div>
//             
//             <div className="text-center w-1/4">
//               <img 
//                 src={match.awayTeam.logoUrl || '/default-team-logo.png'} 
//                 alt={match.awayTeam.name} 
//                 className="w-12 h-12 mx-auto object-contain bg-white rounded-full p-1"
//               />
//               <p className="text-sm font-medium mt-2 text-white">{match.awayTeam.shortName}</p>
//             </div>
//           </div>
//           
//           <div className="mt-4 text-right">
//             <Link 
//               href={`/matches/${match.id}`}
//               className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
//             >
//               View
//             </Link>
//           </div>
//         </div>
//       ))}
//     </div>
//   ) : (
//     <p className="text-center py-6 text-gray-400">No live matches at the moment.</p>
//   )}
// </div>