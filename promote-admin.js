const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all users and promote them to ADMIN for convenience in development
  // Or find a specific user by email/clerkId if provided.
  // Since I don't have the specific userId, I'll update all users or the most recent one.
  
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('No users found in the database. Please sign in to the app first to create a user record.');
    return;
  }

  console.log(`Found ${users.length} users. Promoting all to ADMIN...`);

  const updateResult = await prisma.user.updateMany({
    data: {
      role: 'ADMIN'
    }
  });

  console.log(`Successfully updated ${updateResult.count} users to ADMIN role.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
