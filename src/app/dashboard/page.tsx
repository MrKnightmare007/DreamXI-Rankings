import { redirect } from 'next/navigation';
import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getAuthSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Fetch user data with participation stats
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      participations: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
              winningTeam: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }
    }
  });

  // Fetch matches from the API to ensure consistent filtering
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/matches`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    console.error('Failed to fetch matches for dashboard');
  }
  
  const matchesData = await response.json();
  const upcomingMatches = matchesData?.data?.upcoming?.slice(0, 5) || [];
  
  // Log for debugging
  console.log('Dashboard upcoming matches:', upcomingMatches.length);

  // Fetch cricket API data
  let cricketData = null;
  let filteredCricketData = null;
  let liveMatches = [];
  let completedMatches = [];
  let upcomingCricketMatches = [];
  let apiLimitMessage = null;
  
  try {
    // Using cricket API with series_info endpoint to get all IPL matches
    const cricketApiResponse = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${process.env.CRICKET_API_KEY}&id=d5a498c8-7596-4b93-8ab0-e0efc3345312`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (cricketApiResponse.ok) {
      cricketData = await cricketApiResponse.json();
      console.log('Cricket API series data:', cricketData);
      
      // Process cricket data to categorize matches
      if (cricketData && cricketData.data && cricketData.data.matchList) {
        const allMatches = cricketData.data.matchList || [];
        
        // Create filtered cricket data for display
        filteredCricketData = {
          ...cricketData,
          data: allMatches
        };
        
        // Filter for live matches (matchStarted is true and matchEnded is false)
        liveMatches = allMatches.filter(match => 
          match.matchStarted === true && match.matchEnded === false
        );
        
        // Filter for completed matches (matchEnded is true)
        completedMatches = allMatches.filter(match => 
          match.matchEnded === true
        );
        
        // Filter for upcoming matches (matchStarted is false)
        upcomingCricketMatches = allMatches.filter(match => 
          match.matchStarted === false
        );
        
        console.log('IPL Live matches:', liveMatches.length);
        console.log('IPL Completed matches:', completedMatches.length);
        console.log('IPL Upcoming matches:', upcomingCricketMatches.length);
      }
    } else {
      console.error('Failed to fetch cricket data:', cricketApiResponse.statusText);
    }
  } catch (error) {
    console.error('Error fetching cricket data:', error);
  }

  // Calculate user stats
  const totalMatches = user?.participations.length || 0;
  const totalPoints = user?.participations.reduce((sum, p) => sum + p.points, 0) || 0;
  const avgPoints = totalMatches > 0 ? Math.round(totalPoints / totalMatches) : 0;
  
  return (
    <div className="space-y-8">
      {/* User Stats Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Your Stats</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Skill Score</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user?.skillScore || 0}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Matches Played</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalMatches}</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPoints}</p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Points/Match</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{avgPoints}</p>
          </div>
        </div>
      </section>
      
      {/* Cricket API Data Section */}
      {filteredCricketData && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">IPL Cricket API Data</h2>
          
          {apiLimitMessage && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
              {apiLimitMessage}
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(filteredCricketData, null, 2)}</pre>
          </div>
        </section>
      )}
      
      {/* Live Cricket Matches */}
      {liveMatches.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Live Cricket Matches</h2>
          <div className="space-y-4">
            {liveMatches.map((match) => (
              <div key={match.id} className="border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{match.name}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full text-xs font-medium">
                    Live
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Status:</span> {match.status}</p>
                  <p><span className="font-medium">Venue:</span> {match.venue}</p>
                  <p><span className="font-medium">Date:</span> {new Date(match.dateTimeGMT).toLocaleString()}</p>
                </div>
                {match.score && match.score.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-medium text-sm">Score:</h4>
                    {match.score.map((scoreItem, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-sm">{scoreItem.inning}: {scoreItem.r}/{scoreItem.w} ({scoreItem.o} overs)</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Completed Cricket Matches */}
      {completedMatches.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Completed Cricket Matches</h2>
          <div className="space-y-4">
            {completedMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{match.name}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Result:</span> {match.status}</p>
                  <p><span className="font-medium">Venue:</span> {match.venue}</p>
                  <p><span className="font-medium">Date:</span> {new Date(match.dateTimeGMT).toLocaleString()}</p>
                </div>
                {match.score && match.score.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-medium text-sm">Score:</h4>
                    {match.score.map((scoreItem, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-sm">{scoreItem.inning}: {scoreItem.r}/{scoreItem.w} ({scoreItem.o} overs)</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Upcoming Cricket Matches */}
      {upcomingCricketMatches.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Upcoming IPL Matches</h2>
          <div className="space-y-4">
            {upcomingCricketMatches.map((match) => (
              <div key={match.id} className="border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{match.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Venue:</span> {match.venue}</p>
                  <p><span className="font-medium">Date:</span> {new Date(match.dateTimeGMT).toLocaleString()}</p>
                  {match.teams && match.teams.length > 0 && (
                    <p><span className="font-medium">Teams:</span> {match.teams.join(' vs ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Recent Performance Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Recent Performance</h2>
        
        {user?.participations && user.participations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.participations.map((participation) => (
                  <tr key={participation.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span>{participation.match.homeTeam.shortName}</span>
                        <span>vs</span>
                        <span>{participation.match.awayTeam.shortName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {new Date(participation.match.matchDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
                      {participation.points}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {participation.rank ? `#${participation.rank}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">You haven't participated in any matches yet.</p>
        )}
      </section>
    </div>
  );
}