'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { MealType } from '@prisma/client'

export async function getRecentFoodItems(mealType?: MealType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [] }

  try {
    const recentLogs = await prisma.foodLog.findMany({
      where: {
        user_id: user.id,
        ...(mealType ? { mealType } : {})
      },
      include: {
        food_item: true
      },
      orderBy: {
        logged_at: 'desc'
      },
      take: 20
    })

    // Remove duplicates and keep the most recent ones
    const uniqueItems: any[] = []
    const seenIds = new Set()

    recentLogs.forEach(log => {
      if (!seenIds.has(log.food_item_id)) {
        seenIds.add(log.food_item_id)
        uniqueItems.push(log.food_item)
      }
    })

    return { data: uniqueItems.slice(0, 10) }
  } catch (e) {
    return { data: [] }
  }
}
