'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { MetabolicMotor } from '@/lib/metabolism'
import { revalidatePath } from 'next/cache'
import { calculateNutrition } from '@/lib/metabolism/nutrition'
import { InputMode, MealType } from '@prisma/client'

export async function logFoodEntry(
  foodItemId: string, 
  inputMode: InputMode, 
  inputAmount: number,
  mealType?: MealType,
  notes?: string
) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    if (inputAmount <= 0) {
      return { error: 'Amount must be positive' }
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    })

    if (!foodItem) {
      return { error: 'Food item not found' }
    }

    const calculated = calculateNutrition(foodItem, inputMode, inputAmount)

    const { versionId } = await MetabolicMotor.getContext()

    await prisma.foodLog.create({
      data: {
        user_id: user.id,
        food_item_id: foodItemId,
        model_version_id: versionId,
        inputMode,
        inputAmount,
        mealType,
        notes,
        calculatedGrams: calculated.calculatedGrams,
        calculatedProtein: calculated.calculatedProtein,
        calculatedCarbs: calculated.calculatedCarbs,
        calculatedFat: calculated.calculatedFat,
        calculatedCalories: calculated.calculatedCalories,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    console.error('Error logging food:', e)
    return { error: e.message || 'Failed to record entry' }
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
