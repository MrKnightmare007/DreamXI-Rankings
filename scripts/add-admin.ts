const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Replace these values with your admin user details
  const email = 'admin@example.com';
  const name = 'Admin User';
  const dreamXIUsername = 'admin123';
  const password = 'securepassword123'; // Use a strong password
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create the admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
    },
    create: {
      email,
      name,
      dreamXIUsername,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log(`Admin user created/updated: ${user.name} (${user.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });