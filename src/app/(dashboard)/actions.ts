'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function getDailyTotals() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const now = new Date()
    const start = startOfDay(now)
    const end = endOfDay(now)

    console.log(`[Cockpit] Fetching logs for user ${user.id} between ${start.toISOString()} and ${end.toISOString()}`)

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
      orderBy: {
        logged_at: 'desc'
      }
    })

    console.log(`[Cockpit] Found ${logs.length} logs for today.`)

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
        recentLogs: logs.map(l => ({
          id: l.id,
          name: l.food_item.name,
          weight: l.weight_grams,
          calories: Math.round(l.food_item.calories_100g * (l.weight_grams / 100)),
          time: l.logged_at.toISOString()
        }))
      },
    }
  } catch (e) {
    console.error('Error fetching daily totals:', e)
    return { error: 'Failed to aggregate logs' }
  }
}
