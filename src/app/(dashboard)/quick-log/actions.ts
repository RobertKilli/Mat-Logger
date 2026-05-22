'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { MetabolicMotor } from '@/lib/metabolism'
import { revalidatePath } from 'next/cache'

export async function logFoodEntry(foodItemId: string, grams: number) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    if (grams <= 0) {
      return { error: 'Grams must be positive' }
    }

    const { versionId } = await MetabolicMotor.getContext()

    await prisma.foodLog.create({
      data: {
        user_id: user.id,
        food_item_id: foodItemId,
        weight_grams: grams,
        model_version_id: versionId,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Error logging food:', e)
    return { error: 'Failed to record entry' }
  }
}

export async function deleteFoodLog(logId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    await prisma.foodLog.delete({
      where: {
        id: logId,
        user_id: user.id
      }
    })

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Delete food log error:', e)
    return { error: 'Kunne ikke slette loggføringen.' }
  }
}
