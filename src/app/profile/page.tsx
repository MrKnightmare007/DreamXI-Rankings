import { getAuthSession } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getAuthSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Fetch complete user data from database
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
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
      profilePicture: true,
      createdAt: true,
      participations: {
        select: {
          id: true,
          points: true,
          moneyGained: true,
          moneySpent: true,
          match: {
            select: {
              id: true,
              matchNumber: true,
              season: true,
              homeTeam: {
                select: {
                  name: true,
                  shortName: true,
                  logoUrl: true
                }
              },
              awayTeam: {
                select: {
                  name: true,
                  shortName: true,
                  logoUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
                <img 
                  src={user.profilePicture || user.image || '/default-avatar.png'} 
                  alt={user.name || "User"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">@{user.dreamXIUsername || 'No username'}</p>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Skill Score</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{user.skillScore}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Money</p>
                <p className={`text-xl font-bold ${(user.totalMoneyGained - user.totalMoneyLost) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{(user.totalMoneyGained || 0) - (user.totalMoneyLost || 0)}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              <p>Matches played: {user.participations.length}</p>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Form */}
        <div className="md:col-span-2">
          <ProfileForm user={user} />
          
          {/* Recent Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
            <h3 className="text-lg font-bold mb-4">Recent Matches</h3>
            
            {user.participations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Money</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {user.participations.slice(0, 5).map((participation) => (
                      <tr key={participation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {participation.match.homeTeam.shortName} vs {participation.match.awayTeam.shortName}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              (Match {participation.match.matchNumber})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {participation.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${participation.moneyGained > participation.moneySpent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {participation.moneyGained > participation.moneySpent ? '+' : ''}
                            ₹{participation.moneyGained - participation.moneySpent}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">You haven't participated in any matches yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}