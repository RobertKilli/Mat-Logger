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

export async function getStrengthHistory(days: number = 90) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', data: [] }

  try {
    const logs = await prisma.workoutExercise.findMany({
      where: {
        workout_log: {
          user_id: user.id,
          logged_at: {
            gte: startOfDay(subDays(new Date(), days))
          }
        },
        weight: { gt: 0 }
      },
      include: {
        exercise: true,
        workout_log: {
          select: { logged_at: true }
        }
      },
      orderBy: {
        workout_log: { logged_at: 'asc' }
      }
    })

    // Calculate 1RM (Brzycki) and group by exercise
    const historyMap: Record<string, { name: string, data: { date: Date, oneRM: number }[] }> = {}

    logs.forEach(log => {
      const exerciseId = log.exercise_id
      const oneRM = log.weight! / (1.0278 - (0.0278 * log.reps))
      
      if (!historyMap[exerciseId]) {
        historyMap[exerciseId] = {
          name: log.exercise.name,
          data: []
        }
      }

      // If multiple sets on same day, take the best 1RM
      const lastEntry = historyMap[exerciseId].data[historyMap[exerciseId].data.length - 1]
      const logDate = startOfDay(log.workout_log.logged_at)

      if (lastEntry && startOfDay(lastEntry.date).getTime() === logDate.getTime()) {
        if (oneRM > lastEntry.oneRM) {
          lastEntry.oneRM = Number(oneRM.toFixed(1))
        }
      } else {
        historyMap[exerciseId].data.push({
          date: log.workout_log.logged_at,
          oneRM: Number(oneRM.toFixed(1))
        })
      }
    })

    return { data: Object.values(historyMap) }
  } catch (e) {
    console.error('Error fetching strength history:', e)
    return { error: 'Failed to fetch strength data', data: [] }
  }
}
