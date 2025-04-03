import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MatchStandingsPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  
  // Fix: Await the params object before accessing its properties
  const resolvedParams = await Promise.resolve(params);
  const matchId = resolvedParams.id;
  
  // Fetch match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      winningTeam: true,
      participations: {
        include: {
          user: true,
        },
        orderBy: {
          points: 'desc',
        },
      },
    },
  });
  
  if (!match) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Match Not Found</h1>
        <p className="mb-4">The match you're looking for doesn't exist or has been removed.</p>
        <Link href="/matches" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Matches
        </Link>
      </div>
    );
  }
  
  const matchDate = new Date(match.matchDate);
  
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Match Standings</h1>
        <Link 
          href={`/matches/${matchId}`} 
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          ← Back to Match Details
        </Link>
      </div>
      
      {/* Match Header */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className={`bg-gradient-to-r ${match.isCompleted ? 'from-green-600 to-emerald-600' : new Date() > matchDate ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-purple-600'} p-6 text-white`}>
          <p className="text-sm font-medium mb-2">{formattedDate}</p>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src={match.homeTeam.logoUrl || '/default-team-logo.png'} alt={match.homeTeam.name} className="w-16 h-16 object-contain" />
              <p className="text-lg font-bold">{match.homeTeam.name}</p>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-bold mb-2">VS</p>
              {match.isCompleted && match.winningTeam && (
                <div className="bg-white/20 rounded-full px-4 py-1 text-sm">
                  {match.winningTeam.name} won
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <img src={match.awayTeam.logoUrl || '/default-team-logo.png'} alt={match.awayTeam.name} className="w-16 h-16 object-contain" />
              <p className="text-lg font-bold">{match.awayTeam.name}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Dream11 Standings */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">Dream11 Standings</h2>
        
        {match.participations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {match.participations.map((participation, index) => (
                  <tr key={participation.id} className={session?.user?.email === participation.user.email ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {participation.user.name || participation.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                      {participation.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No users have participated in this match yet.</p>
            {!match.isCompleted && (
              <Link 
                href={`/matches/${matchId}/participate`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Be the first to participate!
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}