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

  // Fetch upcoming matches
  const upcomingMatches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date()
      },
      isCompleted: false
    },
    include: {
      homeTeam: true,
      awayTeam: true
    },
    orderBy: {
      matchDate: 'asc'
    },
    take: 5
  });

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
                  <a 
                    href={`/matches/${match.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming matches scheduled.</p>
        )}
      </section>
      
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