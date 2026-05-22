import { PrismaClient, FoodCategory, BaseUnit } from '@prisma/client'

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
      brand: 'Prior',
      category: 'MEAT' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      calories: 165,
    },
    {
      id: 'item-salmon',
      name: 'Laks',
      category: 'FISH' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      protein: 20,
      carbs: 0,
      fat: 13,
      calories: 208,
    },
    {
      id: 'item-egg',
      name: 'Egg',
      brand: 'Gården',
      category: 'DAIRY' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1582722134903-b1299afbe01f?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      gramsPerUnit: 60,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      calories: 155,
    },
    {
      id: 'item-apple',
      name: 'Eple',
      category: 'FRUIT' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      gramsPerUnit: 150,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      calories: 52,
    },
    {
      id: 'item-broccoli',
      name: 'Brokkoli',
      category: 'VEGETABLE' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      protein: 2.8,
      carbs: 7,
      fat: 0.4,
      calories: 34,
    }
  ]

  for (const item of globalItems) {
    await prisma.foodItem.upsert({
      where: { id: item.id },
      update: {
        category: item.category,
        image_url: item.image_url,
        baseAmount: item.baseAmount,
        baseUnit: item.baseUnit,
        gramsPerUnit: item.gramsPerUnit,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        calories: item.calories,
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
