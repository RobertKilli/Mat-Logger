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
    // PUSH (Bryst, Skuldre, Triceps)
    { name: 'Benkpress (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Benkpress (Stang)', category: 'PUSH' as TrainingCategory },
    { name: 'Skråbenk (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Skråbenk (Stang)', category: 'PUSH' as TrainingCategory },
    { name: 'Flyes (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Flyes (Kabel)', category: 'PUSH' as TrainingCategory },
    { name: 'Push-ups', category: 'PUSH' as TrainingCategory },
    { name: 'Militærpress (Stang)', category: 'PUSH' as TrainingCategory },
    { name: 'Skulderpress (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Sidehev (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Sidehev (Kabel)', category: 'PUSH' as TrainingCategory },
    { name: 'Fronthev (Manualer)', category: 'PUSH' as TrainingCategory },
    { name: 'Dips (Bryst-fokus)', category: 'PUSH' as TrainingCategory },
    { name: 'Dips (Triceps-fokus)', category: 'PUSH' as TrainingCategory },
    { name: 'Triceps Pushdown (Tau)', category: 'PUSH' as TrainingCategory },
    { name: 'Triceps Pushdown (Stang)', category: 'PUSH' as TrainingCategory },
    { name: 'Franskpress', category: 'PUSH' as TrainingCategory },
    { name: 'Overhead Triceps Extension', category: 'PUSH' as TrainingCategory },
    
    // PULL (Rygg, Biceps, Bakside Skulder)
    { name: 'Markløft (Konvensjonell)', category: 'PULL' as TrainingCategory },
    { name: 'Markløft (Sumo)', category: 'PULL' as TrainingCategory },
    { name: 'Chins / Pull-ups', category: 'PULL' as TrainingCategory },
    { name: 'Nedtrekk (Bredt grep)', category: 'PULL' as TrainingCategory },
    { name: 'Nedtrekk (Smalgrep)', category: 'PULL' as TrainingCategory },
    { name: 'Sittende Roing (Kabel)', category: 'PULL' as TrainingCategory },
    { name: 'Stående Roing (Stang)', category: 'PULL' as TrainingCategory },
    { name: 'Ett-arms Roing (Manual)', category: 'PULL' as TrainingCategory },
    { name: 'T-Bar Row', category: 'PULL' as TrainingCategory },
    { name: 'Face Pulls', category: 'PULL' as TrainingCategory },
    { name: 'Reverse Flyes (Manualer)', category: 'PULL' as TrainingCategory },
    { name: 'Biceps Curl (Stang)', category: 'PULL' as TrainingCategory },
    { name: 'Biceps Curl (Manualer)', category: 'PULL' as TrainingCategory },
    { name: 'Hammer Curl', category: 'PULL' as TrainingCategory },
    { name: 'Preacher Curl', category: 'PULL' as TrainingCategory },
    { name: 'Concentration Curl', category: 'PULL' as TrainingCategory },
    { name: 'Lat Pullover (Kabel)', category: 'PULL' as TrainingCategory },
    
    // LEGS (Bein, Rumpe, Legger)
    { name: 'Knebøy (High Bar)', category: 'LEGS' as TrainingCategory },
    { name: 'Knebøy (Low Bar)', category: 'LEGS' as TrainingCategory },
    { name: 'Frontbøy', category: 'LEGS' as TrainingCategory },
    { name: 'Goblet Squat', category: 'LEGS' as TrainingCategory },
    { name: 'Beinpress', category: 'LEGS' as TrainingCategory },
    { name: 'Hack Squat', category: 'LEGS' as TrainingCategory },
    { name: 'Utfall (Gående)', category: 'LEGS' as TrainingCategory },
    { name: 'Bulgarsk Utfall', category: 'LEGS' as TrainingCategory },
    { name: 'Rumensk Markløft', category: 'LEGS' as TrainingCategory },
    { name: 'Leg Extension', category: 'LEGS' as TrainingCategory },
    { name: 'Hamstring Curl (Liggende)', category: 'LEGS' as TrainingCategory },
    { name: 'Hamstring Curl (Sittende)', category: 'LEGS' as TrainingCategory },
    { name: 'Hip Thrust', category: 'LEGS' as TrainingCategory },
    { name: 'Glute Bridge', category: 'LEGS' as TrainingCategory },
    { name: 'Abductor (Maskin)', category: 'LEGS' as TrainingCategory },
    { name: 'Adductor (Maskin)', category: 'LEGS' as TrainingCategory },
    { name: 'Stående Tåhev', category: 'LEGS' as TrainingCategory },
    { name: 'Sittende Tåhev', category: 'LEGS' as TrainingCategory }
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
