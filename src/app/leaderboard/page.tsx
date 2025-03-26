import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export default async function LeaderboardPage() {
  const session = await getAuthSession();
  
  // Fetch all users ordered by skill score
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      dreamXIUsername: true,
      skillScore: true,
      participations: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      skillScore: 'desc'
    }
  });

  // Calculate additional stats
  const usersWithStats = users.map(user => ({
    ...user,
    matchesPlayed: user.participations.length,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Leaderboard</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Top Players</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Players are ranked based on their skill score, which is calculated from their Dream11 performance across all matches.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dream11 Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skill Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matches Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {usersWithStats.map((user, index) => (
                  <tr 
                    key={user.id}
                    className={session && user.id === session.user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {user.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {user.dreamXIUsername}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {user.skillScore}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {user.matchesPlayed}
                    </td>
                  </tr>
                ))}
                
                {usersWithStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No players have participated yet. Be the first to join!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">How Skill Score Works</h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            Your skill score is calculated based on your performance in Dream11 contests for IPL 2025 matches.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400">Factors that affect your skill score:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Points earned in each match</li>
              <li>Your rank compared to other players</li>
              <li>Consistency across multiple matches</li>
              <li>Captain and Vice-Captain selection accuracy</li>
            </ul>
          </div>
          
          <p>
            The more matches you participate in, the more accurate your skill score becomes. Keep playing to improve your ranking!
          </p>
        </div>
      </div>
    </div>
  );
}