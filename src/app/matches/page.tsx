import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MatchesPage() {
  const session = await getAuthSession();
  
  // Fetch current, upcoming and completed matches from the API
  const response = await fetch(`/api/matches`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  
  const { currentAndUpcomingMatches, completedMatches } = await response.json();
  
  // Sort upcoming matches by date (closest first)
  const upcomingMatches = [...currentAndUpcomingMatches].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">IPL 2025 Matches</h1>
      
      {/* Upcoming Matches Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Upcoming Matches</h2>
        
        {upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center w-20">
                    <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-12 h-12 object-contain" />
                    <p className="text-sm font-medium mt-1">{match.homeTeam.shortName}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-lg font-bold my-1">VS</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(match.matchDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center w-20">
                    <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-12 h-12 object-contain" />
                    <p className="text-sm font-medium mt-1">{match.awayTeam.shortName}</p>
                  </div>
                </div>
                
                <div>
                  <Link 
                    href={`/matches/${match.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming matches scheduled.</p>
        )}
      </section>
      
      {/* Completed Matches Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Completed Matches</h2>
        
        {completedMatches.length > 0 ? (
          <div className="space-y-4">
            {completedMatches.map((match) => {
              const userParticipation = match.participations[0];
              
              return (
                <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center w-20">
                      <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-12 h-12 object-contain" />
                      <p className="text-sm font-medium mt-1">{match.homeTeam.shortName}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <div className="flex items-center space-x-2 my-1">
                        <span className={`text-sm font-medium ${match.winningTeamId === match.homeTeamId ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                          {match.homeTeam.shortName}
                        </span>
                        <span className="text-xs">vs</span>
                        <span className={`text-sm font-medium ${match.winningTeamId === match.awayTeamId ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                          {match.awayTeam.shortName}
                        </span>
                      </div>
                      {match.winningTeam && (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          {match.winningTeam.shortName} won
                          {match.winByRuns ? ` by ${match.winByRuns} runs` : ''}
                          {match.winByWickets ? ` by ${match.winByWickets} wickets` : ''}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center w-20">
                      <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-12 h-12 object-contain" />
                      <p className="text-sm font-medium mt-1">{match.awayTeam.shortName}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {userParticipation && (
                      <div className="text-right mb-2">
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
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No completed matches yet.</p>
        )}
      </section>
    </div>
  );
}