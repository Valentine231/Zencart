import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tables = ['User', 'Order', 'Product', 'OrderItem', 'Dispute', 'WhatsappMessage'];
  
  for (const table of tables) {
    try {
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
      console.log(`\n--- ${table} Columns ---`);
      console.log(JSON.stringify(columns, null, 2));
    } catch (e: any) {
      console.error(`Error querying ${table} metadata:`, e.message);
    }
  }

  // Check Enums
  try {
    const enums = await prisma.$queryRaw`
      SELECT t.typname as enum_name, array_agg(e.enumlabel) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname
    `;
    console.log("\n--- Enums in DB ---");
    console.log(JSON.stringify(enums, null, 2));
  } catch (e: any) {
    console.error("Error querying enums:", e.message);
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
