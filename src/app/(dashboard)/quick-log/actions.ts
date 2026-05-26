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

export async function saveMealAsTemplate(name: string, items: { foodItemId: string, inputMode: InputMode, inputAmount: number }[]) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    await prisma.mealTemplate.create({
      data: {
        user_id: user.id,
        name,
        items: {
          create: items.map(item => ({
            food_item_id: item.foodItemId,
            inputMode: item.inputMode,
            inputAmount: item.inputAmount
          }))
        }
      }
    })

    revalidatePath('/library')
    return { success: true }
  } catch (e) {
    console.error('Save meal template error:', e)
    return { error: 'Kunne ikke lagre måltidsmal.' }
  }
}

export async function getMealTemplates() {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const templates = await prisma.mealTemplate.findMany({
      where: { user_id: user.id },
      include: {
        items: {
          include: { food_item: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    })

    return { data: templates }
  } catch (e) {
    console.error('Get meal templates error:', e)
    return { error: 'Kunne ikke hente måltidsmaler.', data: [] }
  }
}

export async function applyMealTemplate(templateId: string, mealType: MealType) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const template = await prisma.mealTemplate.findUnique({
      where: { id: templateId, user_id: user.id },
      include: { items: { include: { food_item: true } } }
    })

    if (!template) return { error: 'Mal ikke funnet.' }

    const { versionId } = await MetabolicMotor.getContext()

    // Log all items in the template
    await Promise.all(template.items.map(item => {
      const calculated = calculateNutrition(item.food_item, item.inputMode, item.inputAmount)
      return prisma.foodLog.create({
        data: {
          user_id: user.id,
          food_item_id: item.food_item_id,
          model_version_id: versionId,
          inputMode: item.inputMode,
          inputAmount: item.inputAmount,
          mealType,
          calculatedGrams: calculated.calculatedGrams,
          calculatedProtein: calculated.calculatedProtein,
          calculatedCarbs: calculated.calculatedCarbs,
          calculatedFat: calculated.calculatedFat,
          calculatedCalories: calculated.calculatedCalories,
        }
      })
    }))

    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('Apply meal template error:', e)
    return { error: 'Kunne ikke logge måltid fra mal.' }
  }
}
