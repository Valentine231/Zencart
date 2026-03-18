import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Adding Role enum and User.role column manually...");

    // 1. Create the Role enum type if it doesn't exist
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log("Role enum created or already existed.");
    } catch (e: any) {
      console.log("Error creating Role enum:", e.message);
    }

    // 2. Add the role column to User table
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" DEFAULT 'USER';
      `);
      console.log("role column added to User table.");
    } catch (e: any) {
      console.log("Error adding role column:", e.message);
    }

    // 3. Add updatedAt column to Order table (optional, but good for completeness)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();
      `);
      console.log("updatedAt column added to Order table.");
    } catch (e: any) {
      console.log("Error adding updatedAt column:", e.message);
    }

    console.log("Manual DB adjustments complete.");
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
