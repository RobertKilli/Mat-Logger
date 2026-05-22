import { PrismaClient, FoodCategory } from '@prisma/client'

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

  console.log('Seeding global food items...')
  
  const globalItems = [
    {
      id: 'item-chicken',
      name: 'Kyllingbryst',
      category: 'MEAT' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=200',
      protein_100g: 31,
      carbs_100g: 0,
      fat_100g: 3.6,
      calories_100g: 165,
    },
    {
      id: 'item-salmon',
      name: 'Laks',
      category: 'FISH' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200',
      protein_100g: 20,
      carbs_100g: 0,
      fat_100g: 13,
      calories_100g: 208,
    },
    {
      id: 'item-egg',
      name: 'Egg',
      category: 'DAIRY' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1582722134903-b1299afbe01f?auto=format&fit=crop&q=80&w=200',
      protein_100g: 13,
      carbs_100g: 1.1,
      fat_100g: 11,
      calories_100g: 155,
    },
    {
      id: 'item-apple',
      name: 'Eple',
      category: 'FRUIT' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=200',
      protein_100g: 0.3,
      carbs_100g: 14,
      fat_100g: 0.2,
      calories_100g: 52,
    },
    {
      id: 'item-broccoli',
      name: 'Brokkoli',
      category: 'VEGETABLE' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&q=80&w=200',
      protein_100g: 2.8,
      carbs_100g: 7,
      fat_100g: 0.4,
      calories_100g: 34,
    }
  ]

  for (const item of globalItems) {
    await prisma.foodItem.upsert({
      where: { id: item.id },
      update: {
        category: item.category,
        image_url: item.image_url,
      },
      create: item,
    })
  }

  console.log('Seeding complete.')
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
