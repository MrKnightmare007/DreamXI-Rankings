'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface MatchPageProps {
  params: {
    id: string;
  };
}

export default function ParticipationPage({ params }: MatchPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const matchId = params.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    points: '',
    captainName: '',
    viceCaptainName: '',
    teamScreenshot: ''
  });

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch match details
  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch match details');
        }
        const data = await response.json();
        setMatchDetails(data);
        
        // Check if match is already completed
        if (data.isCompleted) {
          toast.error('This match is already completed');
          router.push(`/matches/${matchId}`);
        }
        
        // Check if user has already participated
        if (data.userParticipation) {
          toast.error('You have already participated in this match');
          router.push(`/matches/${matchId}`);
        }
      } catch (error) {
        toast.error('Error loading match details');
        console.error(error);
      }
    };

    if (session) {
      fetchMatchDetails();
    }
  }, [matchId, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/participations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          matchId,
          points: parseInt(formData.points),
          captainName: formData.captainName,
          viceCaptainName: formData.viceCaptainName,
          teamScreenshot: formData.teamScreenshot
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Participation recorded successfully!');
      router.push(`/matches/${matchId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to record participation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || !matchDetails) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Record Your Participation</h1>
        <Link 
          href={`/matches/${matchId}`} 
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          ← Back to Match Details
        </Link>
      </div>
      
      {/* Match Info */}
      {matchDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center w-16">
              <img src={matchDetails.homeTeam.logoUrl || '/default-team-logo.png'} alt={matchDetails.homeTeam.name} className="w-10 h-10 object-contain" />
              <p className="text-xs font-medium mt-1">{matchDetails.homeTeam.shortName}</p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(matchDetails.matchDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-bold my-1">VS</p>
            </div>
            
            <div className="flex flex-col items-center w-16">
              <img src={matchDetails.awayTeam.logoUrl || '/default-team-logo.png'} alt={matchDetails.awayTeam.name} className="w-10 h-10 object-contain" />
              <p className="text-xs font-medium mt-1">{matchDetails.awayTeam.shortName}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Participation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Dream11 Points
            </label>
            <input
              id="points"
              name="points"
              type="number"
              value={formData.points}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              min="0"
              max="1000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the points you scored in Dream11 for this match
            </p>
          </div>
          
          <div>
            <label htmlFor="captainName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Captain
            </label>
            <input
              id="captainName"
              name="captainName"
              type="text"
              value={formData.captainName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="viceCaptainName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vice Captain
            </label>
            <input
              id="viceCaptainName"
              name="viceCaptainName"
              type="text"
              value={formData.viceCaptainName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="teamScreenshot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Screenshot URL (Optional)
            </label>
            <input
              id="teamScreenshot"
              name="teamScreenshot"
              type="url"
              value={formData.teamScreenshot}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Provide a URL to your Dream11 team screenshot (optional)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Participation'}
          </button>
        </form>
      </div>
    </div>
  );
}