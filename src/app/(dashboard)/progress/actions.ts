'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays } from 'date-fns'

export async function getWeightHistory(days: number = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', data: [] }

  try {
    const logs = await prisma.weightLog.findMany({
      where: {
        user_id: user.id,
        logged_at: {
          gte: startOfDay(subDays(new Date(), days))
        }
      },
      orderBy: {
        logged_at: 'asc'
      }
    })

    return { data: logs }
  } catch (e) {
    console.error('Error fetching weight history:', e)
    return { error: 'Failed to fetch weight data', data: [] }
  }
}

export async function logWeight(weight: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    // 1. Update User current weight
    await prisma.user.update({
      where: { id: user.id },
      data: { weight }
    })

    // 2. Create WeightLog entry
    await prisma.weightLog.create({
      data: {
        user_id: user.id,
        weight
      }
    })

    return { success: true }
  } catch (e) {
    console.error('Error logging weight:', e)
    return { error: 'Failed to log weight' }
  }
}
