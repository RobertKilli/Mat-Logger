'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { MetabolicMotor } from '@/lib/metabolism'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TrainingCategory } from '@prisma/client'

export async function logWorkout(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const category = formData.get('category') as TrainingCategory
  const duration = parseInt(formData.get('duration') as string)
  const intensity = parseInt(formData.get('intensity') as string)

  if (!category || !['PUSH', 'PULL', 'LEGS'].includes(category)) {
    return { error: 'Invalid category' }
  }

  if (isNaN(duration) || duration <= 0) {
    return { error: 'Invalid duration' }
  }

  if (isNaN(intensity) || intensity < 1 || intensity > 10) {
    return { error: 'Intensity must be between 1 and 10' }
  }

  try {
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
    return { error: 'Failed to record session' }
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
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
    return { error: 'Failed to synchronize calibration' }
  }
}
