import { getAuthSession } from '../../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AdminMatchForm from '@/components/AdminMatchForm';
import { ArrowLeft } from 'lucide-react'; // Add this import

export default async function AdminMatchDetailsPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  
  // Check if user is admin
  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  if (user?.role !== 'ADMIN') {
    redirect('/');
  }
  
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
              dreamXIUsername: true,
              profilePicture: true
            }
          }
        }
      }
    }
  });
  
  if (!match) {
    return notFound();
  }
  
  // Fetch all users for adding participations
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      dreamXIUsername: true,
      profilePicture: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to Admin Matches
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold">
        Admin: Match #{match.matchNumber || match.id.substring(0, 2)}
      </h1>
      
      {/* Match Header */}
      <div className={`relative rounded-xl p-8 ${match.isCompleted ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-white text-sm font-medium">
          {match.isCompleted ? 'Completed' : 'Upcoming'}
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
      
      {/* Admin Match Form */}
      <AdminMatchForm match={match} users={users} />
    </div>
  );
}