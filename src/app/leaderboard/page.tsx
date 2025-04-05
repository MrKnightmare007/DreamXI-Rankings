import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Leaderboard from '@/components/Leaderboard';

export default async function LeaderboardPage() {
  // Fetch users with their money stats, explicitly excluding admins
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      dreamXIUsername: true,
      skillScore: true,
      totalMoneyGained: true,
      totalMoneyLost: true,
      participations: {
        select: {
          points: true,
          matchId: true
        }
      }
    },
    orderBy: {
      skillScore: 'desc',
    },
  });

  // Calculate additional stats for each user
  const usersWithStats = users.map(user => {
    // Calculate matches played
    const matchesPlayed = user.participations.length;
    
    // Calculate average points per match
    const avgPointsPerMatch = matchesPlayed > 0 
      ? Math.round(user.participations.reduce((sum, p) => sum + p.points, 0) / matchesPlayed) 
      : 0;
    
    return {
      ...user,
      matchesPlayed,
      avgPointsPerMatch
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Ranking Rules</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Primary ranking is based on skill score (total points earned)</li>
          <li>Users with the same skill score are ranked by average points per match</li>
          <li>If still tied, users are ranked by net money earned</li>
        </ul>
      </div>
      <Leaderboard users={usersWithStats} />
    </div>
  );
}