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

 
  // Fetch cricket API data
  let cricketData = null;
  let filteredCricketData = null;
  let apiLimitMessage = null;
  
 

  // Calculate user stats
  const totalMatches = user?.participations.length || 0;
  const totalPoints = user?.participations.reduce((sum, p) => sum + p.points, 0) || 0;
  const avgPoints = totalMatches > 0 ? Math.round(totalPoints / totalMatches) : 0;
  const moneySpent = user?.participations.reduce((sum, p) => sum + (p.moneySpent || 0), 0) || 0;
  const moneyGained = user?.participations.reduce((sum, p) => sum + (p.moneyGained || 0), 0) || 0;
  const netProfit = moneyGained - moneySpent;
  
  return (
    <div className="space-y-8">
      {/* User Stats Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Your Stats</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
        
        {/* Financial Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Money Spent (₹)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{moneySpent}</p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Money Gained (₹)</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{moneyGained}</p>
          </div>
          
          <div className={`${netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'} p-4 rounded-lg`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit/Loss (₹)</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {netProfit}
            </p>
          </div>
        </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gained (₹)</th>
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
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-red-600 dark:text-red-400">
                      {participation.moneySpent || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-yellow-600 dark:text-yellow-400">
                      {participation.moneyGained || 0}
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