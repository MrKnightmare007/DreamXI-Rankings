import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate data
    if (data.dreamXIUsername) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          dreamXIUsername: data.dreamXIUsername,
          email: { not: session.user.email }
        }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Dream11 username is already taken' },
          { status: 400 }
        );
      }
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        name: data.name,
        dreamXIUsername: data.dreamXIUsername,
        profilePicture: data.profilePicture
      }
    });
    
    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        dreamXIUsername: updatedUser.dreamXIUsername,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}