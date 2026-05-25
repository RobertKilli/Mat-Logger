import { PrismaClient, FoodCategory, BaseUnit, TrainingCategory } from '@prisma/client'

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
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
      caloriesPer100g: 165,
    },
    {
      id: 'item-salmon',
      name: 'Laks',
      category: 'FISH' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      proteinPer100g: 20,
      carbsPer100g: 0,
      fatPer100g: 13,
      caloriesPer100g: 208,
    },
    {
      id: 'item-egg',
      name: 'Egg',
      brand: 'Gården',
      category: 'DAIRY' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1582722134903-b1299afbe01f?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      gramsPerUnit: 55,
      proteinPer100g: 13,
      carbsPer100g: 1.1,
      fatPer100g: 11,
      caloriesPer100g: 155,
    },
    {
      id: 'item-apple',
      name: 'Eple',
      category: 'FRUIT' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      gramsPerUnit: 150,
      proteinPer100g: 0.3,
      carbsPer100g: 14,
      fatPer100g: 0.2,
      caloriesPer100g: 52,
    },
    {
      id: 'item-broccoli',
      name: 'Brokkoli',
      category: 'VEGETABLE' as FoodCategory,
      image_url: 'https://images.unsplash.com/photo-1452948491233-ad8a1ed01085?auto=format&fit=crop&q=80&w=200',
      baseAmount: 100,
      baseUnit: 'GRAM' as BaseUnit,
      proteinPer100g: 2.8,
      carbsPer100g: 7,
      fatPer100g: 0.4,
      caloriesPer100g: 34,
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
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g,
        caloriesPer100g: item.caloriesPer100g,
      },
      create: item,
    })
  }

  console.log('Seeding global exercises...')

  const globalExercises = [
    // PUSH
    { name: 'Benkpress', category: 'PUSH' as TrainingCategory },
    { name: 'Militærpress', category: 'PUSH' as TrainingCategory },
    { name: 'Dips', category: 'PUSH' as TrainingCategory },
    { name: 'Sidehev', category: 'PUSH' as TrainingCategory },
    { name: 'Triceps Pushdown', category: 'PUSH' as TrainingCategory },
    
    // PULL
    { name: 'Markløft', category: 'PULL' as TrainingCategory },
    { name: 'Nedtrekk', category: 'PULL' as TrainingCategory },
    { name: 'Stående Roing', category: 'PULL' as TrainingCategory },
    { name: 'Face Pulls', category: 'PULL' as TrainingCategory },
    { name: 'Biceps Curl', category: 'PULL' as TrainingCategory },
    
    // LEGS
    { name: 'Knebøy', category: 'LEGS' as TrainingCategory },
    { name: 'Beinpress', category: 'LEGS' as TrainingCategory },
    { name: 'Utfall', category: 'LEGS' as TrainingCategory },
    { name: 'Leg Extension', category: 'LEGS' as TrainingCategory },
    { name: 'Hamstring Curl', category: 'LEGS' as TrainingCategory },
    { name: 'Tåhev', category: 'LEGS' as TrainingCategory }
  ]

  for (const ex of globalExercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: { category: ex.category },
      create: ex
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
