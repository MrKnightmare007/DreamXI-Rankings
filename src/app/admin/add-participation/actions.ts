'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function addParticipation(formData: FormData) {
  const userId = formData.get('userId') as string;
  const matchId = formData.get('matchId') as string;
  const points = parseInt(formData.get('points') as string);
  const rank = formData.get('rank') ? parseInt(formData.get('rank') as string) : null;
  const moneySpent = parseInt(formData.get('moneySpent') as string);
  const moneyGained = parseInt(formData.get('moneyGained') as string);

  try {
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
      // Update existing participation
      await prisma.participation.update({
        where: {
          id: existingParticipation.id
        },
        data: {
          points,
          rank,
          moneySpent,
          moneyGained
        }
      });
    } else {
      // Create new participation
      await prisma.participation.create({
        data: {
          userId,
          matchId,
          points,
          rank,
          moneySpent,
          moneyGained
        }
      });
    }

    // Update user's skill score
    await updateUserSkillScore(userId);

    revalidatePath('/admin/participations');
    revalidatePath('/leaderboard');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error adding participation:', error);
    return { success: false, error: 'Failed to add participation' };
  }
}

// Helper function to update user's skill score
async function updateUserSkillScore(userId: string) {
  const participations = await prisma.participation.findMany({
    where: {
      userId
    }
  });
  
  // Calculate skill score based on points and other factors
  let skillScore = 0;
  
  if (participations.length > 0) {
    // Sum of all points
    const totalPoints = participations.reduce((sum, p) => sum + p.points, 0);
    
    // Base skill score is average points
    skillScore = Math.round(totalPoints / participations.length);
    
    // You can add more complex calculations here if needed
  }
  
  // Update user's skill score
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      skillScore
    }
  });
}