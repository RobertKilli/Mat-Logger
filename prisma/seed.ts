import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding metabolic models...')

  const baseVersion = await prisma.modelVersion.upsert({
    where: { id: 'v1.0-base' },
    update: {},
    create: {
      id: 'v1.0-base',
      version_name: 'v1.0-base',
      is_active: true,
    },
  })

  console.log(`Seeded model version: ${baseVersion.version_name}`)

  console.log('Seeding test food items...')
  const testFood = await prisma.foodItem.upsert({
    where: { id: 'test-chicken' },
    update: {},
    create: {
      id: 'test-chicken',
      name: 'Kyllingbryst',
      protein_100g: 31,
      carbs_100g: 0,
      fat_100g: 3.6,
      calories_100g: 165,
    },
  })

  console.log(`Seeded food item: ${testFood.name}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
