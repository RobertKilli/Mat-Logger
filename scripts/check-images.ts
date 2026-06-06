import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExercises() {
  const exercises = await prisma.exercise.findMany({
    select: {
      name: true,
      image_url: true,
    }
  })

  const withImages = exercises.filter(ex => ex.image_url !== null)
  console.log(`Total exercises: ${exercises.length}`)
  console.log(`Exercises with images: ${withImages.length}`)
  
  if (withImages.length > 0) {
    console.log('Sample image URLs:')
    withImages.slice(0, 3).forEach(ex => console.log(`${ex.name}: ${ex.image_url?.substring(0, 50)}...`))
  }
}

checkExercises()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
