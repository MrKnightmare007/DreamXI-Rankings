import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../auth/[...nextauth]/route';

// Function to calculate and update user's skill score and money stats
async function updateUserStats(userId: string, moneySpent: number = 0, moneyGained: number = 0) {
  // Get all participations for this user
  const participations = await prisma.participation.findMany({
    where: { userId }
  });
  
  // Calculate skill score based on points
  let skillScore = 0;
  
  if (participations.length > 0) {
    // Sum of all points
    const totalPoints = participations.reduce((sum, p) => sum + p.points, 0);
    
    // Base skill score is average points
    skillScore = Math.round(totalPoints / participations.length);
  }
  
  // Get current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalMoneyGained: true, totalMoneyLost: true }
  });
  
  // Update user's stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      skillScore,
      totalMoneyGained: (user?.totalMoneyGained || 0) + moneyGained,
      totalMoneyLost: (user?.totalMoneyLost || 0) + moneySpent
    }
  });
}

// Function to calculate and update user's skill score
async function updateUserSkillScore(userId: string) {
  const participations = await prisma.participation.findMany({
    where: { userId }
  });
  
  // Calculate skill score based on total points
  let skillScore = 0;
  
  if (participations.length > 0) {
    // Sum of all points - store total points instead of average
    skillScore = participations.reduce((sum, p) => sum + p.points, 0);
  }
  
  // Update user's skill score
  await prisma.user.update({
    where: { id: userId },
    data: { skillScore }
  });
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { userId, points, rank, moneySpent, moneyGained } = await request.json();
    // Fix: Use destructuring to get the ID
    const { id: matchId } = context.params;

    // Validate required fields
    if (!userId || !matchId) {
      return new Response(JSON.stringify({ error: 'User ID and Match ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if participation already exists
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId
        }
      }
    });

    if (existingParticipation) {
      return new Response(JSON.stringify({ 
        error: 'User is already participating in this match' 
      }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create participation
    const participation = await prisma.participation.create({
      data: {
        userId,
        matchId,
        points: points || 0,
        rank,
        moneySpent: moneySpent || 50,
        moneyGained: moneyGained || 0
      }
    });

    // Update user's stats including skill score and money
    await updateUserStats(userId, moneySpent || 50, moneyGained || 0);

    return new Response(JSON.stringify(participation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating participation:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create participation', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}