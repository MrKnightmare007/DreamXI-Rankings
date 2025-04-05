// ... existing imports ...

export default async function AddParticipationPage() {
  // ... existing code ...
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Add Participation</h1>
      
      <form action={addParticipation} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
        {/* ... existing form fields ... */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User
            </label>
            <select
              id="userId"
              name="userId"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.dreamXIUsername})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="matchId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Match
            </label>
            <select
              id="matchId"
              name="matchId"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select Match</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeTeam.shortName} vs {match.awayTeam.shortName} ({new Date(match.matchDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points
            </label>
            <input
              type="number"
              id="points"
              name="points"
              min="0"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label htmlFor="moneySpent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Money Spent (₹)
            </label>
            <input
              type="number"
              id="moneySpent"
              name="moneySpent"
              min="0"
              defaultValue="50"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label htmlFor="moneyGained" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Money Gained (₹)
            </label>
            <input
              type="number"
              id="moneyGained"
              name="moneyGained"
              min="0"
              defaultValue="0"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rank (optional)
          </label>
          <input
            type="number"
            id="rank"
            name="rank"
            min="1"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Add Participation
          </button>
        </div>
      </form>
    </div>
  );
}