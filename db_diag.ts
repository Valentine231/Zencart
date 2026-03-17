import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  })
  const sample = await prisma.product.findMany({
    take: 5,
    select: { title: true, category: true }
  })
  
  console.log(JSON.stringify({
    total: count,
    categories,
    sample
  }, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
