'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMatchForm({ match, users }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [winningTeamId, setWinningTeamId] = useState(match.winningTeamId || '');
  const [winByRuns, setWinByRuns] = useState(match.winByRuns || 0);
  const [winByWickets, setWinByWickets] = useState(match.winByWickets || 0);
  const [isCompleted, setIsCompleted] = useState(match.isCompleted || false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for user participations
  // First, update the participations state to include moneySpent and moneyGained
  // At the beginning of your component, add this console log
  console.log('Initial match participations:', match.participations);
  
  // Then check the state initialization
  const [participations, setParticipations] = useState(
    match.participations.map(p => {
      console.log('Mapping participation:', p);
      return {
        id: p.id,
        userId: p.userId,
        points: p.points,
        moneySpent: p.moneySpent || 0,
        moneyGained: p.moneyGained || 0,
        userName: p.user?.name || p.user?.email || p.user?.dreamXIUsername || 'Unknown User'
      };
    })
  );
  
  // State for adding new participation - replace the individual states with a combined object
  const [newParticipation, setNewParticipation] = useState({
    userId: '',
    points: 0,
    rank: null,
    moneySpent: 0,
    moneyGained: 0
  });
  
  // Add this debugging code at the beginning of your component
  useEffect(() => {
    console.log('Participations state:', participations);
  }, [participations]);

  const handleUpdateMatch = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winningTeamId: winningTeamId || null,
          winByRuns: winByRuns || 0,
          winByWickets: winByWickets || 0,
          isCompleted
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update match');
      }
      
      // If match is marked as completed, trigger the sync
      if (isCompleted && !match.isCompleted) {
        try {
          const syncResponse = await fetch('/api/sync-matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!syncResponse.ok) {
            console.error('Failed to sync matches');
          } else {
            console.log('Matches synced successfully');
          }
        } catch (syncError) {
          console.error('Error syncing matches:', syncError);
        }
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleUpdateParticipation = async (participationId, points) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/participations/${participationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update participation');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error updating participation:', error);
      alert('Failed to update participation. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddParticipation = async (e) => {
    e.preventDefault();
    
    if (!newParticipation.userId) {
      alert('Please select a user');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/matches/${match.id}/participations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newParticipation.userId,
          points: newParticipation.points,
          rank: newParticipation.rank,
          moneySpent: newParticipation.moneySpent,
          moneyGained: newParticipation.moneyGained
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add participation');
      }
      
      const data = await response.json();
      
      // Update this part in your handleAddParticipation function
      // Add new participation to the list
      const user = users.find(u => u.id === newParticipation.userId);
      setParticipations([
        ...participations,
        {
          id: data.id,
          userId: newParticipation.userId,
          points: newParticipation.points,
          moneySpent: newParticipation.moneySpent,
          moneyGained: newParticipation.moneyGained,
          userName: user.name || user.email || user.dreamXIUsername
        }
      ]);
      
      // Reset form
      setNewParticipation({
        userId: '',
        points: 0,
        rank: null,
        moneySpent: 50,
        moneyGained: 0
      });
      
      router.refresh();
    } catch (error) {
      console.error('Error adding participation:', error);
      alert('Failed to add participation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // In the handleDeleteParticipation function
  const handleDeleteParticipation = async (participationId) => {
    console.log('Attempting to delete participation with ID:', participationId);
    console.log('Type of participationId:', typeof participationId);
    
    if (!participationId) {
      console.error('Participation ID is undefined');
      alert('Cannot delete participation: ID is missing');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this participation?')) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/participations/${participationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete participation');
      }
      
      // Remove the deleted participation from the state
      setParticipations(participations.filter(p => p.id !== participationId));
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting participation:', error);
      alert('Failed to delete participation. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Match Result Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Update Match Result</h2>
        
        <form onSubmit={handleUpdateMatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Winning Team
              </label>
              <select
                value={winningTeamId}
                onChange={(e) => setWinningTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Winning Team</option>
                <option value={match.homeTeamId}>{match.homeTeam.name}</option>
                <option value={match.awayTeamId}>{match.awayTeam.name}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Match Status
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCompleted" className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as Completed
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Win by Runs
              </label>
              <input
                type="number"
                value={winByRuns}
                onChange={(e) => setWinByRuns(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Win by Wickets
              </label>
              <input
                type="number"
                value={winByWickets}
                onChange={(e) => setWinByWickets(parseInt(e.target.value) || 0)}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Match Result'}
            </button>
          </div>
        </form>
      </div>
      
      {/* User Participations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">User Participations</h2>
        
        {/* Add New Participation */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Participation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-1">User</label>
              <select 
                id="userId" 
                value={newParticipation.userId} 
                onChange={(e) => setNewParticipation({...newParticipation, userId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id} className="text-gray-900 bg-white dark:text-white dark:bg-gray-700">
                    {user.name} ({user.dreamXIUsername || 'No username'})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="points" className="block text-sm font-medium mb-1">Points</label>
              <input 
                type="number" 
                id="points" 
                value={newParticipation.points || ''} 
                onChange={(e) => setNewParticipation({...newParticipation, points: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                placeholder="Enter points"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="rank" className="block text-sm font-medium mb-1">Rank (optional)</label>
              <input 
                type="number" 
                id="rank" 
                value={newParticipation.rank || ''} 
                onChange={(e) => setNewParticipation({...newParticipation, rank: e.target.value ? parseInt(e.target.value) : null})}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
              />
            </div>
            
            <div>
              <label htmlFor="moneySpent" className="block text-sm font-medium mb-1">Money Spent (₹)</label>
              <input 
                type="number" 
                id="moneySpent" 
                value={newParticipation.moneySpent || ''} 
                onChange={(e) => setNewParticipation({...newParticipation, moneySpent: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                placeholder="Enter money spent"
              />
            </div>
            
            <div>
              <label htmlFor="moneyGained" className="block text-sm font-medium mb-1">Money Gained (₹)</label>
              <input 
                type="number" 
                id="moneyGained" 
                value={newParticipation.moneyGained || ''} 
                onChange={(e) => setNewParticipation({...newParticipation, moneyGained: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                placeholder="Enter money gained"
              />
            </div>
          </div>
          
          <button 
            onClick={handleAddParticipation} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            disabled={!newParticipation.userId || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Participation'}
          </button>
        </div>
        
        {/* Participations Table */}
        {participations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Money Spent (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Money Gained (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {participations.map((participation) => {
                  console.log('Rendering participation:', participation);
                  return (
                    <tr key={participation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {participation.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={participation.points === 0 ? '' : participation.points}
                          placeholder="Enter points"
                          onChange={(e) => {
                            const newPoints = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            setParticipations(participations.map(p => 
                              p.id === participation.id ? { ...p, points: newPoints } : p
                            ));
                          }}
                          min="0"
                          className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        {participation.moneySpent || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        {participation.moneyGained || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            console.log('Save button clicked for participation:', participation.id);
                            handleUpdateParticipation(participation.id, participation.points);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            console.log('Delete button clicked for participation:', participation);
                            console.log('Participation ID:', participation.id);
                            handleDeleteParticipation(participation.id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No participations yet. Add users using the form above.
          </p>
        )}
      </div>
    </div>
  );
}