import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'HDD', mode: 'insensitive' } },
        { description: { contains: 'HDD', mode: 'insensitive' } },
        { title: { contains: 'Hard Drive', mode: 'insensitive' } },
        { description: { contains: 'Hard Drive', mode: 'insensitive' } },
        { title: { contains: 'Disk', mode: 'insensitive' } },
        { description: { contains: 'Disk', mode: 'insensitive' } }
      ]
    },
    select: { title: true, category: true, description: true }
  })
  
  console.log(JSON.stringify(products, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
