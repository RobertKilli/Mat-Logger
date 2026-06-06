'use server'

import { prisma } from '@/lib/prisma'
import { generateExerciseImage } from '@/lib/ai/imageGenerator'
import { revalidatePath } from 'next/cache'

export async function refreshExerciseImage(exerciseId: string) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    })

    if (!exercise) return { error: 'Exercise not found' }

    const imageUrl = await generateExerciseImage(exercise.name, exercise.category)

    if (!imageUrl) return { error: 'Failed to generate image' }

    // Update DB with the new DALL-E URL (temporary URL, ideally we would upload to Supabase Storage)
    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { image_url: imageUrl }
    })

    revalidatePath('/training')
    return { success: true, imageUrl }
  } catch (e) {
    console.error('Refresh image error:', e)
    return { error: 'Failed to update exercise visual' }
  }
}

export async function batchGenerateImages() {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { image_url: null },
      take: 5
    })

    if (exercises.length === 0) return { success: true, count: 0, updatedExercises: [] }

    const results = await Promise.all(exercises.map(async (ex) => {
      const res = await refreshExerciseImage(ex.id)
      return res.success ? { id: ex.id, imageUrl: res.imageUrl } : null
    }))

    const updated = results.filter(r => r !== null)

    return { 
      success: true, 
      count: updated.length,
      updatedExercises: updated 
    }
  } catch (e) {
    console.error('Batch generation failed:', e)
    return { error: 'Batch generation failed' }
  }
}
