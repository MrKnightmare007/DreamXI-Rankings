'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LiveMatchFromAPI({ match }) {
  const [homeTeamLogo, setHomeTeamLogo] = useState('/default-team-logo.png');
  const [awayTeamLogo, setAwayTeamLogo] = useState('/default-team-logo.png');
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState('In Progress');
  const [homeTeamClass, setHomeTeamClass] = useState('');
  const [awayTeamClass, setAwayTeamClass] = useState('');
  
  // Map Cricket API team names to your database team names and CSS classes
  const mapTeamName = (apiTeamName) => {
    const teamMap = {
      'Kolkata Knight Riders': { name: 'Kolkata Knight Riders', class: 'team-kkr' },
      'Mumbai Indians': { name: 'Mumbai Indians', class: 'team-mi' },
      'Chennai Super Kings': { name: 'Chennai Super Kings', class: 'team-csk' },
      'Royal Challengers Bangalore': { name: 'Royal Challengers Bangalore', class: 'team-rcb' },
      'Delhi Capitals': { name: 'Delhi Capitals', class: 'team-dc' },
      'Sunrisers Hyderabad': { name: 'Sunrisers Hyderabad', class: 'team-srh' },
      'Punjab Kings': { name: 'Punjab Kings', class: 'team-pbks' },
      'Rajasthan Royals': { name: 'Rajasthan Royals', class: 'team-rr' },
      'Gujarat Titans': { name: 'Gujarat Titans', class: 'team-gt' },
      'Lucknow Super Giants': { name: 'Lucknow Super Giants', class: 'team-lsg' }
    };
    
    return teamMap[apiTeamName] || { name: apiTeamName, class: '' };
  };
  
  const fetchCurrentMatchStatus = async () => {
    try {
      const response = await fetch('https://api.cricapi.com/v1/currentMatches?apikey=8ab9eb0f-8b69-4068-b7b4-8ccb975fd254&offset=0');
      if (response.ok) {
        const data = await response.json();
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
            const homeTeamInfo = mapTeamName(match.teams[0]);
            const homeTeam = teams.find(team => 
              team.name.toLowerCase() === homeTeamInfo.name.toLowerCase() || 
              team.shortName.toLowerCase() === homeTeamInfo.name.toLowerCase()
            );
            
            // Find away team
            const awayTeamInfo = mapTeamName(match.teams[1]);
            const awayTeam = teams.find(team => 
              team.name.toLowerCase() === awayTeamInfo.name.toLowerCase() || 
              team.shortName.toLowerCase() === awayTeamInfo.name.toLowerCase()
            );
            
            if (homeTeam && homeTeam.logoUrl) {
              setHomeTeamLogo(homeTeam.logoUrl);
            }
            
            if (awayTeam && awayTeam.logoUrl) {
              setAwayTeamLogo(awayTeam.logoUrl);
            }
            
            // Set team classes for styling
            setHomeTeamClass(homeTeamInfo.class);
            setAwayTeamClass(awayTeamInfo.class);
          }
        }
      } catch (error) {
        console.error('Error fetching team logos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamLogos();
    fetchCurrentMatchStatus();
    
    // Set up interval to refresh match status
    const intervalId = setInterval(fetchCurrentMatchStatus, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, [match]);
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="ipl-card overflow-hidden"
    >
      <div className="flex flex-col">
        {/* Match header with status */}
        <div className="bg-gradient-to-r from-[var(--ipl-blue)] to-[#003366] text-white p-3 text-center">
          <div className="text-sm font-semibold">{match.name || 'IPL Match'}</div>
          <div className="text-xs opacity-80">{match.venue || 'Venue TBD'}</div>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              matchStatus.includes('won') ? 'bg-green-500' : 
              matchStatus === 'In Progress' ? 'bg-yellow-500 text-black' : 'bg-blue-600'
            }`}
          >
            {matchStatus}
          </motion.div>
        </div>
        
        {/* Teams section */}
        <div className="p-4 flex justify-between items-center">
          {/* Home team */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center text-center w-2/5"
          >
            <div className={`w-16 h-16 rounded-full p-1 flex items-center justify-center ${homeTeamClass || 'bg-gray-100 dark:bg-gray-700'}`}>
              <img 
                src={homeTeamLogo} 
                alt={match.teams[0]} 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="mt-2 font-semibold text-sm">{match.teams[0]}</div>
            {match.score && match.score[0] && (
              <div className="text-xs mt-1">{match.score[0]}</div>
            )}
          </motion.div>
          
          {/* VS */}
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-gray-400">VS</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(match.date).toLocaleDateString()}
            </div>
          </div>
          
          {/* Away team */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center text-center w-2/5"
          >
            <div className={`w-16 h-16 rounded-full p-1 flex items-center justify-center ${awayTeamClass || 'bg-gray-100 dark:bg-gray-700'}`}>
              <img 
                src={awayTeamLogo} 
                alt={match.teams[1]} 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="mt-2 font-semibold text-sm">{match.teams[1]}</div>
            {match.score && match.score[1] && (
              <div className="text-xs mt-1">{match.score[1]}</div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}