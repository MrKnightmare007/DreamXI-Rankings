'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMatchForm({ match, users }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [winningTeamId, setWinningTeamId] = useState(match.winningTeamId || '');
  const [winByRuns, setWinByRuns] = useState(match.winByRuns || 0);
  const [winByWickets, setWinByWickets] = useState(match.winByWickets || 0);
  const [isCompleted, setIsCompleted] = useState(match.isCompleted || false);
  
  // State for user participations
  const [participations, setParticipations] = useState(
    match.participations.map(p => ({
      id: p.id,
      userId: p.userId,
      points: p.points,
      userName: p.user.name || p.user.email || p.user.dreamXIUsername
    }))
  );
  
  // State for adding new participation
  const [newUserId, setNewUserId] = useState('');
  const [newPoints, setNewPoints] = useState(0);
  
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
    
    if (!newUserId) {
      alert('Please select a user');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/matches/${match.id}/participations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newUserId,
          points: newPoints
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add participation');
      }
      
      const data = await response.json();
      
      // Add new participation to the list
      const user = users.find(u => u.id === newUserId);
      setParticipations([
        ...participations,
        {
          id: data.id,
          userId: newUserId,
          points: newPoints,
          userName: user.name || user.email || user.dreamXIUsername
        }
      ]);
      
      // Reset form
      setNewUserId('');
      setNewPoints(0);
      
      router.refresh();
    } catch (error) {
      console.error('Error adding participation:', error);
      alert('Failed to add participation. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteParticipation = async (participationId) => {
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
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Add New Participation</h3>
          
          <form onSubmit={handleAddParticipation} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User
              </label>
              <select
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {user.name || user.email || user.dreamXIUsername}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points
              </label>
              <input
                type="number"
                value={newPoints === 0 ? '' : newPoints}
                placeholder="Enter points"
                onChange={(e) => {
                  // Use direct value assignment instead of Number() to avoid leading zeros
                  setNewPoints(e.target.value === '' ? 0 : parseInt(e.target.value, 10))
                }}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isUpdating || !newUserId}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Add Participation
              </button>
            </div>
          </form>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {participations.map((participation) => (
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
                          // Use direct value assignment instead of Number()
                          const newPoints = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setParticipations(participations.map(p => 
                            p.id === participation.id ? { ...p, points: newPoints } : p
                          ));
                        }}
                        min="0"
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateParticipation(participation.id, participation.points)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteParticipation(participation.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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