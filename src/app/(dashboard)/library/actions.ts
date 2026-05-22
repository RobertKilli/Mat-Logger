'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { searchExternalFood } from '@/lib/metabolism/externalSearch'
import { FoodCategory, BaseUnit } from '@prisma/client'
import { startOfDay, format, subDays } from 'date-fns'

/**
 * Unified History Action
 */
export async function getUnifiedHistory() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { 
        protein_goal: true,
        subscription_tier: true 
      }
    })

    const proteinGoal = user?.protein_goal || 0
    const isPremium = user?.subscription_tier === 'PREMIUM'
    
    // FREE users only see the last 7 days of unified history
    const historyLimitDate = isPremium ? new Date(0) : subDays(new Date(), 7)

    // Fetch logs with limit for free users
    const [workouts, foodLogs] = await Promise.all([
      prisma.workoutLog.findMany({
        where: { 
          user_id: authUser.id,
          logged_at: { gte: historyLimitDate }
        },
        orderBy: { logged_at: 'desc' },
      }),
      prisma.foodLog.findMany({
        where: { 
          user_id: authUser.id,
          logged_at: { gte: historyLimitDate }
        },
        orderBy: { logged_at: 'desc' },
      })
    ])

    // Group by day
    const historyMap: Record<string, {
      date: string
      workouts: typeof workouts
      food: {
        protein: number
        carbs: number
        fat: number
        calories: number
        logs: typeof foodLogs
      }
      isDeficient: boolean
      deficiencyReason: string | null
    }> = {}

    foodLogs.forEach(log => {
      const dayKey = format(startOfDay(new Date(log.logged_at)), 'yyyy-MM-dd')
      if (!historyMap[dayKey]) {
        historyMap[dayKey] = {
          date: dayKey,
          workouts: [],
          food: { protein: 0, carbs: 0, fat: 0, calories: 0, logs: [] },
          isDeficient: false,
          deficiencyReason: null
        }
      }
      historyMap[dayKey].food.protein += log.calculatedProtein
      historyMap[dayKey].food.carbs += log.calculatedCarbs
      historyMap[dayKey].food.fat += log.calculatedFat
      historyMap[dayKey].food.calories += log.calculatedCalories
      historyMap[dayKey].food.logs.push(log)
    })

    workouts.forEach(log => {
      const dayKey = format(startOfDay(new Date(log.logged_at)), 'yyyy-MM-dd')
      if (!historyMap[dayKey]) {
        historyMap[dayKey] = {
          date: dayKey,
          workouts: [],
          food: { protein: 0, carbs: 0, fat: 0, calories: 0, logs: [] },
          isDeficient: false,
          deficiencyReason: null
        }
      }
      historyMap[dayKey].workouts.push(log)
    })

    // Deficiency analysis
    Object.values(historyMap).forEach(day => {
      if (proteinGoal > 0 && day.food.protein < proteinGoal) {
        day.isDeficient = true
        day.deficiencyReason = isPremium 
          ? `Manko på protein: ${Math.round(proteinGoal - day.food.protein)}g gjenstår`
          : `Manko oppdaget (Oppgrader for detaljer)`
      }
    })

    const sortedHistory = Object.values(historyMap).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return { 
      data: sortedHistory,
      proteinGoal,
      tier: user?.subscription_tier || 'FREE'
    }
  } catch (e) {
    console.error('Error fetching unified history:', e)
    return { error: 'Failed to retrieve operational history' }
  }
}

/**
 * Smart Lookup Action
 */
export async function lookupExternalFood(name: string) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { subscription_tier: true }
    })

    if (user?.subscription_tier !== 'PREMIUM') {
       return { error: 'Smart Lookup er kun tilgjengelig for Premium-piloter. Oppgrader i profilmenyen.' }
    }

    const results = await searchExternalFood(name, true)
    return { data: results }
  } catch (e) {
    console.error('External lookup error:', e)
    return { error: 'External lookup failed' }
  }
}

/**
 * Search Action
 */
export async function searchFoodItems(query: string, options: { preferNorwegian?: boolean, includeExternal?: boolean } = {}) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  try {
    const user = await prisma.user.findUnique({
       where: { id: authUser.id },
       select: { subscription_tier: true }
    })

    const isPremium = user?.subscription_tier === 'PREMIUM'

    // 1. Search internal DB
    const internalItems = await prisma.foodItem.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        OR: [
          { user_id: null }, 
          { user_id: authUser.id },
        ],
      },
      orderBy: [{ user_id: 'desc' }, { name: 'asc' }],
    })

    // 2. Search External (OFF) if requested and user is premium
    let externalItems: any[] = []
    if (options.includeExternal && isPremium) {
      externalItems = await searchExternalFood(query, options.preferNorwegian ?? true)
    }

    return { 
      data: {
        internal: internalItems,
        external: externalItems,
        isPremium
      }
    }
  } catch (e) {
    console.error('Search error:', e)
    return { error: 'Search failed' }
  }
}

/**
 * Add Food Action
 */
export async function addFoodItem(data: {
  name: string
  brand?: string
  category: FoodCategory
  image_url?: string
  baseAmount: number
  baseUnit: BaseUnit
  gramsPerUnit?: number
  servingSize?: number
  servingUnit?: string
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  caloriesPer100g: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const item = await prisma.foodItem.create({
      data: {
        ...data,
        user_id: user.id,
      }
    })

    revalidatePath('/library')
    return { data: item }
  } catch (e) {
    console.error('Add food error:', e)
    return { error: 'Failed to create food item' }
  }
}

/**
 * Fork Action (Save external item to personal library)
 */
export async function forkFoodItem(
  originalItemId: string,
  updates: {
    name: string
    brand?: string
    category?: FoodCategory
    image_url?: string
    baseAmount?: number
    baseUnit?: BaseUnit
    gramsPerUnit?: number
    servingSize?: number
    servingUnit?: string
    protein: number
    carbs: number
    fat: number
    calories: number
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
    const newItem = await prisma.foodItem.create({
      data: {
        user_id: user.id,
        name: updates.name,
        brand: updates.brand,
        category: updates.category ?? 'OTHER',
        image_url: updates.image_url,
        baseAmount: updates.baseAmount ?? 100,
        baseUnit: updates.baseUnit ?? 'GRAM',
        gramsPerUnit: updates.gramsPerUnit,
        servingSize: updates.servingSize,
        servingUnit: updates.servingUnit,
        proteinPer100g: updates.protein,
        carbsPer100g: updates.carbs,
        fatPer100g: updates.fat,
        caloriesPer100g: updates.calories,
      },
    })

    revalidatePath('/library')
    return { data: newItem }
  } catch (e) {
    console.error('Fork error:', e)
    return { error: 'Failed to create personal variant' }
  }
}

/**
 * Delete Action
 */
export async function deleteFoodItem(itemId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.foodItem.delete({
      where: {
        id: itemId,
        user_id: user.id
      }
    })

    revalidatePath('/library')
    return { success: true }
  } catch (e) {
    console.error('Delete food item error:', e)
    return { error: 'Kunne ikke slette matvaren.' }
  }
}

/**
 * Categorized Library Action
 */
export async function getCategorizedLibrary() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const usedItems = await prisma.foodItem.findMany({
      where: {
        OR: [
          { user_id: user.id },
          { 
            food_logs: {
              some: { user_id: user.id }
            }
          }
        ]
      },
      orderBy: { name: 'asc' }
    })

    const categorized = usedItems.reduce((acc, item) => {
      const cat = item.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, typeof usedItems>)

    return { data: categorized }
  } catch (e) {
    console.error('Library fetch error:', e)
    return { error: 'Failed to fetch categorized library' }
  }
}
