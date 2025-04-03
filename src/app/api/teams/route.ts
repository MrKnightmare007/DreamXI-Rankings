import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch teams',
        error: error.message
      },
      { status: 500 }
    );
  }
}