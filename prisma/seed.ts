import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create IPL teams
  // Create IPL teams
  const teams = await prisma.team.createMany({
    data: [
      {
        name: 'Chennai Super Kings',
        shortName: 'CSK',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/logos/Roundbig/CSKroundbig.png'
      },
      {
        name: 'Delhi Capitals',
        shortName: 'DC',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Roundbig/DCroundbig.png'
      },
      {
        name: 'Gujarat Titans',
        shortName: 'GT',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Roundbig/GTroundbig.png'
      },
      {
        name: 'Kolkata Knight Riders',
        shortName: 'KKR',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Roundbig/KKRroundbig.png'
      },
      {
        name: 'Lucknow Super Giants',
        shortName: 'LSG',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Roundbig/LSGroundbig.png'
      },
      {
        name: 'Mumbai Indians',
        shortName: 'MI',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Roundbig/MIroundbig.png'
      },
      {
        name: 'Punjab Kings',
        shortName: 'PBKS',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Roundbig/PBKSroundbig.png'
      },
      {
        name: 'Rajasthan Royals',
        shortName: 'RR',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundbig/RRroundbig.png'
      },
      {
        name: 'Royal Challengers Bangalore',
        shortName: 'RCB',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png'
      },
      {
        name: 'Sunrisers Hyderabad',
        shortName: 'SRH',
        logoUrl: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Roundbig/SRHroundbig.png'
      }
    ]
  });

  // Create sample matches
  await prisma.match.createMany({
    data: [
      {
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        matchDate: new Date('2025-05-01T19:30:00Z'),
        season: 2025,
        venue: 'Wankhede Stadium',
        isCompleted: false
      },
      {
        homeTeamId: teams[2].id,
        awayTeamId: teams[3].id,
        matchDate: new Date('2025-05-02T15:30:00Z'),
        season: 2025,
        venue: 'Eden Gardens',
        isCompleted: false
      },
      {
        homeTeamId: teams[1].id,
        awayTeamId: teams[2].id,
        matchDate: new Date('2025-04-28T19:30:00Z'),
        season: 2025,
        venue: 'M. Chinnaswamy Stadium',
        isCompleted: true,
        winningTeamId: teams[1].id
      }
    ]
  });



  // Check if teams already exist
  const existingTeams = await prisma.team.findMany();
  if (existingTeams.length === 0) {
    console.log('Creating IPL teams...');
    for (const team of teams) {
      await prisma.team.create({
        data: team
      });
    }
    console.log('Teams created successfully!');
  } else {
    console.log('Teams already exist, skipping team creation.');
  }

  // Fetch created teams for match creation
  const dbTeams = await prisma.team.findMany();
  const teamMap = dbTeams.reduce((map, team) => {
    map[team.shortName] = team.id;
    return map;
  }, {} as Record<string, string>);

  // Check if matches already exist for the current season
  const existingMatches = await prisma.match.count({
    where: { season: 2025 }
  });

  if (existingMatches === 0) {
    console.log('Creating IPL 2025 matches...');
    
    // Create matches - a mix of upcoming and completed matches
    const now = new Date();
    const matches = [
      // Completed matches (past dates)
      {
        matchNumber: 1,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15, 19, 30),
        homeTeamId: teamMap['CSK'],
        awayTeamId: teamMap['RCB'],
        winningTeamId: teamMap['CSK'],
        winByRuns: 23,
        isCompleted: true
      },
      {
        matchNumber: 2,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14, 19, 30),
        homeTeamId: teamMap['PBKS'],
        awayTeamId: teamMap['DC'],
        winningTeamId: teamMap['DC'],
        winByWickets: 4,
        isCompleted: true
      },
      {
        matchNumber: 3,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 15, 30),
        homeTeamId: teamMap['KKR'],
        awayTeamId: teamMap['SRH'],
        winningTeamId: teamMap['KKR'],
        winByRuns: 45,
        isCompleted: true
      },
      {
        matchNumber: 4,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12, 19, 30),
        homeTeamId: teamMap['RR'],
        awayTeamId: teamMap['LSG'],
        winningTeamId: teamMap['LSG'],
        winByWickets: 6,
        isCompleted: true
      },
      {
        matchNumber: 5,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 11, 19, 30),
        homeTeamId: teamMap['MI'],
        awayTeamId: teamMap['GT'],
        winningTeamId: teamMap['GT'],
        winByRuns: 12,
        isCompleted: true
      },
      
      // Current/Upcoming matches (future dates)
      {
        matchNumber: 6,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 30),
        homeTeamId: teamMap['RCB'],
        awayTeamId: teamMap['PBKS'],
        isCompleted: false
      },
      {
        matchNumber: 7,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 30),
        homeTeamId: teamMap['CSK'],
        awayTeamId: teamMap['GT'],
        isCompleted: false
      },
      {
        matchNumber: 8,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 30),
        homeTeamId: teamMap['SRH'],
        awayTeamId: teamMap['MI'],
        isCompleted: false
      },
      {
        matchNumber: 9,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 19, 30),
        homeTeamId: teamMap['DC'],
        awayTeamId: teamMap['RR'],
        isCompleted: false
      },
      {
        matchNumber: 10,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 19, 30),
        homeTeamId: teamMap['LSG'],
        awayTeamId: teamMap['KKR'],
        isCompleted: false
      },
      {
        matchNumber: 11,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 19, 30),
        homeTeamId: teamMap['PBKS'],
        awayTeamId: teamMap['SRH'],
        isCompleted: false
      },
      {
        matchNumber: 12,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 19, 30),
        homeTeamId: teamMap['RCB'],
        awayTeamId: teamMap['MI'],
        isCompleted: false
      },
      {
        matchNumber: 13,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 15, 30),
        homeTeamId: teamMap['GT'],
        awayTeamId: teamMap['DC'],
        isCompleted: false
      },
      {
        matchNumber: 14,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 19, 30),
        homeTeamId: teamMap['RR'],
        awayTeamId: teamMap['CSK'],
        isCompleted: false
      },
      {
        matchNumber: 15,
        season: 2025,
        matchDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 19, 30),
        homeTeamId: teamMap['KKR'],
        awayTeamId: teamMap['PBKS'],
        isCompleted: false
      }
    ];

    for (const match of matches) {
      await prisma.match.create({
        data: match
      });
    }
    console.log('Matches created successfully!');
  } else {
    console.log('Matches already exist for the current season, skipping match creation.');
  }

  console.log('Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });