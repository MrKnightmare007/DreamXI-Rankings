'use client';

import { useState, useEffect } from 'react';

export default function LiveMatchFromAPI({ match }) {
  const [homeTeamLogo, setHomeTeamLogo] = useState('/default-team-logo.png');
  const [awayTeamLogo, setAwayTeamLogo] = useState('/default-team-logo.png');
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState('In Progress');
  
  // Map Cricket API team names to your database team names
  const mapTeamName = (apiTeamName) => {
    const teamMap = {
      'Kolkata Knight Riders': 'Kolkata Knight Riders',
      'Mumbai Indians': 'Mumbai Indians',
      'Chennai Super Kings': 'Chennai Super Kings',
      'Royal Challengers Bangalore': 'Royal Challengers Bangalore',
      'Delhi Capitals': 'Delhi Capitals',
      'Sunrisers Hyderabad': 'Sunrisers Hyderabad',
      'Punjab Kings': 'Punjab Kings',
      'Rajasthan Royals': 'Rajasthan Royals',
      'Gujarat Titans': 'Gujarat Titans',
      'Lucknow Super Giants': 'Lucknow Super Giants'
    };
    
    return teamMap[apiTeamName] || apiTeamName;
  };
  
  const fetchCurrentMatchStatus = async () => {
    try {
      const response = await fetch('https://api.cricapi.com/v1/currentMatches?apikey=8ab9eb0f-8b69-4068-b7b4-8ccb975fd254&offset=0');
      if (response.ok) {
        const data = await response.json();
        console.log('Current Matches Data:', data);
        if (data.data) {
          // Get the team names from the current match
          const homeTeamName = match.teams[0];
          const awayTeamName = match.teams[1];
          
          // Find the matching match in the current matches API
          const currentMatch = data.data.find(m => 
            (m.teams[0] === homeTeamName && m.teams[1] === awayTeamName) || 
            (m.teams[0] === awayTeamName && m.teams[1] === homeTeamName)
          );
          
          if (currentMatch) {
            // Update the match status
            setMatchStatus(currentMatch.status || 'In Progress');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current match status:', error);
    }
  };
  
  useEffect(() => {
    const fetchTeamLogos = async () => {
      try {
        // Fetch team data from your API
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teamsData = await response.json();
          
          if (teamsData && teamsData.data) {
            const teams = teamsData.data;
            
            // Find home team
            const homeTeamName = mapTeamName(match.teams[0]);
            const homeTeam = teams.find(team => 
              team.name.toLowerCase() === homeTeamName.toLowerCase() || 
              team.shortName.toLowerCase() === homeTeamName.toLowerCase()
            );
            
            // Find away team
            const awayTeamName = mapTeamName(match.teams[1]);
            const awayTeam = teams.find(team => 
              team.name.toLowerCase() === awayTeamName.toLowerCase() || 
              team.shortName.toLowerCase() === awayTeamName.toLowerCase()
            );
            
            if (homeTeam && homeTeam.logoUrl) {
              setHomeTeamLogo(homeTeam.logoUrl);
            }
            
            if (awayTeam && awayTeam.logoUrl) {
              setAwayTeamLogo(awayTeam.logoUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching team logos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamLogos();
    fetchCurrentMatchStatus(); // Fetch the current match status when component mounts
  }, [match.teams]);
  
  const handleSync = async () => {
    // Refresh the current match status instead of syncing with the database
    await fetchCurrentMatchStatus();
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center relative">
      {/* LIVE indicator moved to top left */}
      <span className="absolute top-2 left-2 text-xs animate-pulse font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
        LIVE
      </span>
      
      <div className="flex items-center justify-between w-full">
        {/* Home Team - Left Side */}
        <div className="flex flex-col items-center w-1/3">
          <img 
            src={homeTeamLogo} 
            alt={match.teams[0]} 
            className="w-12 h-12 object-contain" 
            onError={() => setHomeTeamLogo('/default-team-logo.png')} 
          />
          <p className="text-sm font-medium mt-1">{match.teams[0]}</p>
        </div>
        
        {/* Match Info - Center */}
        <div className="text-center w-1/3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(match.dateTimeGMT).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <div className="flex items-center justify-center my-1">
            <span className="text-lg font-bold">VS</span>
          </div>
          {/* Status shown below VS - now using the fetched status */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {matchStatus}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {match.venue}
          </p>
        </div>
        
        {/* Away Team - Right Side */}
        <div className="flex flex-col items-center w-1/3">
          <img 
            src={awayTeamLogo} 
            alt={match.teams[1]} 
            className="w-12 h-12 object-contain" 
            onError={() => setAwayTeamLogo('/default-team-logo.png')} 
          />
          <p className="text-sm font-medium mt-1">{match.teams[1]}</p>
        </div>
      </div>
      
      <div>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          onClick={handleSync}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}