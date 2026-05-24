'use server'

import { createClient } from '@/utils/supabase/server'
import { getSafePrisma } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function getDailyTotals(dateStr?: string) {
  const supabase = await createClient()
  const prisma = getSafePrisma()

  // MOCK DATA for Simulation Mode
  const mockData = {
    protein: 124.5,
    carbs: 185.0,
    fat: 62.3,
    calories: 1850,
    recentLogs: [],
    proteinGoal: 180,
    isSimulated: true
  }

  if (!prisma) {
    return { data: mockData }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const targetDate = dateStr ? parseISO(dateStr) : new Date()
    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)

    try {
      const logs = await prisma.foodLog.findMany({
        where: {
          user_id: user.id,
          logged_at: { gte: start, lte: end },
        },
        include: { food_item: true },
        orderBy: { logged_at: 'asc' }
      })

      const totals = logs.reduce(
        (acc, log) => {
          return {
            protein: acc.protein + log.calculatedProtein,
            carbs: acc.carbs + log.calculatedCarbs,
            fat: acc.fat + log.calculatedFat,
            calories: acc.calories + log.calculatedCalories,
          }
        },
        { protein: 0, carbs: 0, fat: 0, calories: 0 }
      )

      return {
        data: {
          protein: Number(totals.protein.toFixed(1)),
          carbs: Number(totals.carbs.toFixed(1)),
          fat: Number(totals.fat.toFixed(1)),
          calories: Math.round(totals.calories),
          recentLogs: logs.map(l => ({
            id: l.id,
            name: l.food_item.name,
            weight: l.calculatedGrams,
            calories: Math.round(l.calculatedCalories),
            time: l.logged_at.toISOString(),
            mealType: l.mealType,
            inputMode: l.inputMode,
            inputAmount: l.inputAmount
          }))
        },
      }
    } catch (dbError) {
      console.warn('getDailyTotals: DB connection failed, falling back to mock data.')
      return { data: mockData }
    }
  } catch (e) {
    return { error: 'Failed to aggregate logs' }
  }
}
