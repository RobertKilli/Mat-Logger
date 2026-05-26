'use server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { MetabolicMotor } from '@/lib/metabolism'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TrainingCategory } from '@prisma/client'

export async function getExercisesByCategory(category: TrainingCategory) {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    })
    return { data: exercises }
  } catch (e) {
    return { error: 'Failed to fetch exercises', data: [] }
  }
}

export async function getWorkoutTemplates(category?: TrainingCategory) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] }

    const templates = await prisma.workoutTemplate.findMany({
      where: { 
        user_id: user.id,
        ...(category ? { category } : {})
      },
      include: {
        template_exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { updated_at: 'desc' }
    })
    return { data: templates }
  } catch (e) {
    return { error: 'Failed to fetch templates', data: [] }
  }
}

export async function saveWorkoutAsTemplate(name: string, category: TrainingCategory, exercises: any[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    await prisma.workoutTemplate.create({
      data: {
        user_id: user.id,
        name,
        category,
        template_exercises: {
          create: exercises.map((ex, index) => ({
            exercise_id: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            order: index
          }))
        }
      }
    })

    revalidatePath('/training')
    return { success: true }
  } catch (e) {
    console.error('Save template error:', e)
    return { error: 'Failed to save routine' }
  }
}

export async function logWorkoutExtended(data: {
...
  category: TrainingCategory
  duration: number
  intensity: number
  exercises: {
    exerciseId: string
    sets: number
    reps: number
    weight?: number
    notes?: string
  }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { versionId } = await MetabolicMotor.getContext()

    const workout = await prisma.workoutLog.create({
      data: {
        user_id: user.id,
        category: data.category,
        duration_minutes: data.duration,
        intensity: data.intensity,
        model_version_id: versionId,
        workout_exercises: {
          create: data.exercises.map((ex, index) => ({
            exercise_id: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            notes: ex.notes,
            order: index
          }))
        }
      }
    })

    revalidatePath('/')
    return { success: true, workoutId: workout.id }
  } catch (e) {
    console.error('Extended workout log error:', e)
    return { error: 'Failed to record session' }
  }
}

export async function logWorkout(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized', status: 401 }
    }

    const categoryInput = formData.get('category') as string
    const duration = parseInt(formData.get('duration') as string)
    const intensity = parseInt(formData.get('intensity') as string)

    // Validate TrainingCategory enum
    if (!Object.values(TrainingCategory).includes(categoryInput as TrainingCategory)) {
      return { error: 'Invalid training category', status: 400 }
    }
    const category = categoryInput as TrainingCategory

    if (isNaN(duration) || duration <= 0) {
      return { error: 'Invalid duration', status: 400 }
    }

    if (isNaN(intensity) || intensity < 1 || intensity > 10) {
      return { error: 'Intensity must be between 1 and 10', status: 400 }
    }

    const { versionId } = await MetabolicMotor.getContext()

    await prisma.workoutLog.create({
      data: {
        user_id: user.id,
        category,
        duration_minutes: duration,
        intensity,
        model_version_id: versionId,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error logging workout:', e)
    return { error: 'Failed to record session', status: 500 }
  }
}

export async function recordSubjectiveFeedback(
  workoutId: string,
  data: {
    rating: number
    notes: string
    predictedFatigue: number
  }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized', status: 401 }
    }

    // Metric range validation (Patch 2)
    if (data.rating < 1 || data.rating > 10) {
      return { error: 'Rating must be between 1 and 10', status: 400 }
    }

    if (data.predictedFatigue < 1 || data.predictedFatigue > 10) {
      return { error: 'Predicted fatigue must be between 1 and 10', status: 400 }
    }

    await prisma.workoutLog.update({
      where: {
        id: workoutId,
        user_id: user.id, // Security check
      },
      data: {
        subjective_fatigue: data.rating,
        subjective_notes: data.notes,
        predicted_fatigue_at_log: data.predictedFatigue,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error recording feedback:', e)
    return { error: 'Failed to synchronize calibration', status: 500 }
  }
}
