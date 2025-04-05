// ... existing code ...

// Update your Leaderboard component to include the new fields
export default function Leaderboard({ users }) {
  // Sort users by skill score * matches played, then by avg points per match, then by net money
  const sortedUsers = [...users].sort((a, b) => {
    // First sort by skill score * matches played
    const aWeightedScore = a.skillScore * (a.matchesPlayed || 1);
    const bWeightedScore = b.skillScore * (b.matchesPlayed || 1);
    
    if (bWeightedScore !== aWeightedScore) {
      return bWeightedScore - aWeightedScore;
    }
    
    // If weighted scores are equal, sort by average points per match
    if (b.avgPointsPerMatch !== a.avgPointsPerMatch) {
      return b.avgPointsPerMatch - a.avgPointsPerMatch;
    }
    
    // If still equal, sort by net money
    return (b.totalMoneyGained || 0) - (b.totalMoneyLost || 0) - 
           ((a.totalMoneyGained || 0) - (a.totalMoneyLost || 0));
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RANK
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                USER
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                WEIGHTED SCORE
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                MATCHES
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                AVG POINTS/MATCH
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                MONEY GAINED
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                MONEY LOST
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                NET MONEY
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedUsers.map((user, index) => {
              const weightedScore = user.skillScore * (user.matchesPlayed || 1);
              
              return (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img className="h-10 w-10 rounded-full" src={user.image} alt={user.name || user.email} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || user.email || user.dreamXIUsername || 'Anonymous User'}
                        </div>
                        {user.dreamXIUsername && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.dreamXIUsername}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                    {weightedScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.matchesPlayed || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.avgPointsPerMatch || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    ₹{user.totalMoneyGained || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    ₹{user.totalMoneyLost || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${(user.totalMoneyGained || 0) - (user.totalMoneyLost || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{(user.totalMoneyGained || 0) - (user.totalMoneyLost || 0)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}