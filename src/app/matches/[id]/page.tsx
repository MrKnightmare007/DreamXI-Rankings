import { notFound } from 'next/navigation';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface MatchPageProps {
  params: {
    id: string;
  };
}

export default async function MatchDetailPage({ params }: MatchPageProps) {
  const session = await getAuthSession();
  const matchId = params.id;
  
  // Fetch match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      winningTeam: true,
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              dreamXIUsername: true,
              skillScore: true
            }
          }
        },
        orderBy: {
          points: 'desc'
        }
      }
    }
  });
  
  if (!match) {
    notFound();
  }
  
  // Check if current user has participated
  const userParticipation = session ? 
    match.participations.find(p => p.user.id === session.user.id) : 
    null;
  
  // Format match date
  const matchDate = new Date(match.matchDate);
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Match #{match.matchNumber}</h1>
        <Link 
          href="/matches" 
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          ← Back to Matches
        </Link>
      </div>
      
      {/* Match Header */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className={`bg-gradient-to-r ${match.isCompleted ? 'from-green-600 to-emerald-600' : new Date() > matchDate ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-purple-600'} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          {match.isCompleted ? (
            <div className="bg-white/20 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">Completed</span>
            </div>
          ) : new Date() > matchDate ? (
            <div className="animate-pulse bg-white/20 px-3 py-1 rounded-full flex items-center">
              <div className="h-2 w-2 bg-white rounded-full mr-2" />
              <span className="text-sm">Live</span>
            </div>
          ) : (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Upcoming
            </div>
          )}
        </div>
        <p className="text-sm font-medium mb-2">{formattedDate} • {formattedTime}</p>
        <div className="flex justify-between items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-20 h-20 object-contain" />
              <p className="text-xl font-bold">{match.homeTeam.name}</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">VS</p>
              {match.isCompleted && match.winningTeam && (
                <div className="bg-white/20 rounded-full px-4 py-1 text-sm">
                  {match.winningTeam.name} won
                  {match.winByRuns ? ` by ${match.winByRuns} runs` : ''}
                  {match.winByWickets ? ` by ${match.winByWickets} wickets` : ''}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-20 h-20 object-contain" />
              <p className="text-xl font-bold">{match.awayTeam.name}</p>
            </div>
          </div>
        </div>
        
        {/* Match Status */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <p className="text-lg font-medium">
                {match.isCompleted ? 'Match Completed' : new Date() > matchDate ? 'Match In Progress' : 'Match Upcoming'}
              </p>
              {!match.isCompleted && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {matchDate > new Date() ? 
                    `Starts in ${Math.ceil((matchDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days` : 
                    'Live updates every 30 seconds'}
                </span>
              )}
            </div>
            {!match.isCompleted && session && (
              <Link 
                href={`/matches/${match.id}/participate`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Enter Your Dream11 Team
              </Link>
            )}
          </div>
          
          {userParticipation && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-2">Your Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Points Scored</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userParticipation.points}</p>
                </div>
                {userParticipation.rank && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your Rank</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{userParticipation.rank}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Participants</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{match.participations.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Leaderboard Section */}
      {match.participations.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Leaderboard</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dream11 Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skill Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {match.participations.map((participation, index) => (
                  <tr 
                    key={participation.id}
                    className={session && participation.user.id === session.user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {participation.user.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {participation.user.dreamXIUsername}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {participation.points}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {participation.user.skillScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}