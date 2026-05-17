'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function getDailyTotals() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // For MVP, we assume server time matches user time or handle offset later.
    // Ideally, pass user timezone here.
    const now = new Date()
    const start = startOfDay(now)
    const end = endOfDay(now)

    const logs = await prisma.foodLog.findMany({
      where: {
        user_id: user.id,
        logged_at: {
          gte: start,
          lte: end,
        },
      },
      include: {
        food_item: true,
      },
    })

    const totals = logs.reduce(
      (acc, log) => {
        const scale = log.weight_grams / 100
        return {
          protein: acc.protein + log.food_item.protein_100g * scale,
          carbs: acc.carbs + log.food_item.carbs_100g * scale,
          fat: acc.fat + log.food_item.fat_100g * scale,
          calories: acc.calories + log.food_item.calories_100g * scale,
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
      },
    }
  } catch (e) {
    console.error('Error fetching daily totals:', e)
    return { error: 'Failed to aggregate logs' }
  }
}
