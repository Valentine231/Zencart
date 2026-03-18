import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check User role column
    try {
      const userColumns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User'
      `;
      console.log("\nUser Table Columns:");
      console.log(JSON.stringify(userColumns, null, 2));
    } catch (e: any) {
      console.error("Error querying User table metadata:", e.message);
    }

    // Check Order status column
    try {
      const orderColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'status'
      `;
      console.log("\nOrder status Column Info:");
      console.log(JSON.stringify(orderColumns, null, 2));

      const enumValues = await prisma.$queryRaw`
        SELECT enumlabel
        FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'OrderStatus'
      `;
      console.log("\nOrderStatus Enum Values in DB:");
      console.log(JSON.stringify(enumValues, null, 2));
    } catch (e: any) {
      console.error("Error querying Order table metadata:", e.message);
    }
  } catch (error: any) {
    console.error("\nUnexpected error:", error.message);
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
