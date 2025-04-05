import { getAuthSession } from '../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function MatchDetailsPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  const matchId = params.id;
  
  // Fetch match details with teams and participations
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
              email: true,
              // Remove the 'image' field as it doesn't exist in your schema
              // Add any other fields that do exist in your User model
              profilePicture: true
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
    return notFound();
  }
  
  // Find user's participation if logged in
  const userParticipation = session?.user?.email 
    ? match.participations.find(p => p.user.email === session.user.email) 
    : null;
  
  // Calculate ranks for all participants
  let currentRank = 1;
  let previousPoints = null;
  let skipRank = 0;
  
  const participationsWithRanks = match.participations.map((participation, index) => {
    if (previousPoints !== null && previousPoints !== participation.points) {
      currentRank = currentRank + skipRank;
      skipRank = 0;
    }
    
    skipRank++;
    previousPoints = participation.points;
    
    return {
      ...participation,
      rank: currentRank
    };
  });
  
  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <Link href="/matches" className="text-blue-600 hover:text-blue-800 flex items-center">
          ← Back to Matches
        </Link>
        <h1 className="text-3xl font-bold text-center flex-grow">Match #{match.matchNumber || '1'}</h1>
      </div>
      
      {/* Match Header */}
      <div className={`relative rounded-xl p-8 ${match.isCompleted ? 'bg-green-600' : match.isLive ? 'bg-blue-600' : 'bg-gray-600'} text-white`}>
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-white text-sm font-medium">
          {match.isLive ? 'LIVE' : match.isCompleted ? 'Completed' : 'Upcoming'}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-center w-1/3">
            <img 
              src={match.homeTeam.logoUrl || '/default-team-logo.png'} 
              alt={match.homeTeam.name} 
              className="w-16 h-16 mx-auto object-contain bg-white rounded-full p-1"
            />
            <h2 className="text-xl font-bold mt-2">{match.homeTeam.name}</h2>
            <p className="text-sm opacity-80">{match.homeTeam.shortName}</p>
          </div>
          
          <div className="text-center w-1/3">
            <p className="text-sm opacity-80">
              {new Date(match.matchDate).toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-2xl font-bold my-2">VS</p>
            <p className="text-sm opacity-80">
              {new Date(match.matchDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-sm opacity-80 mt-1">{match.venue}</p>
            
            {match.completed && match.winningTeam && (
              <div className="mt-3 py-1 px-3 bg-white text-green-700 rounded-full inline-block">
                <p className="text-sm font-bold">
                  {match.winningTeam.name} won
                  {match.winByRuns ? ` by ${match.winByRuns} runs` : ''}
                  {match.winByWickets ? ` by ${match.winByWickets} wickets` : ''}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center w-1/3">
            <img 
              src={match.awayTeam.logoUrl || '/default-team-logo.png'} 
              alt={match.awayTeam.name} 
              className="w-16 h-16 mx-auto object-contain bg-white rounded-full p-1"
            />
            <h2 className="text-xl font-bold mt-2">{match.awayTeam.name}</h2>
            <p className="text-sm opacity-80">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>
      
      {/* User's Participation */}
      {userParticipation && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Performance</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-300">Your Points</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userParticipation.points}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Your Rank</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                #{participationsWithRanks.find(p => p.id === userParticipation.id)?.rank || '-'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        
        {participationsWithRanks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {participationsWithRanks.map((participation) => (
                  <tr key={participation.id} className={
                    userParticipation?.id === participation.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  }>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        participation.rank === 1 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : participation.rank === 2 
                            ? 'bg-gray-100 text-gray-800' 
                            : participation.rank === 3 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-50 text-gray-600'
                      }`}>
                        {participation.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {participation.user.profilePicture && (
                          <img 
                            src={participation.user.profilePicture} 
                            alt={participation.user.name || 'User'} 
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <span>{participation.user.name || participation.user.email}</span>
                      </div>
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
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No participants yet.
          </p>
        )}
      </div>
    </div>
  );
}