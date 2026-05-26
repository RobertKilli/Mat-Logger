'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, format } from 'date-fns'

export async function getConsistencyData() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return { error: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { protein_goal: true, calorie_goal: true }
    })

    const proteinGoal = user?.protein_goal || 0
    const calorieGoal = user?.calorie_goal || 2500

    const daysToTrack = 7
    const startDate = startOfDay(subDays(new Date(), daysToTrack - 1))

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        user_id: authUser.id,
        logged_at: { gte: startDate }
      }
    })

    // Group by day
    const dailyTotals: Record<string, { protein: number, calories: number }> = {}
    
    foodLogs.forEach(log => {
      const dayKey = format(log.logged_at, 'yyyy-MM-dd')
      if (!dailyTotals[dayKey]) dailyTotals[dayKey] = { protein: 0, calories: 0 }
      dailyTotals[dayKey].protein += log.calculatedProtein
      dailyTotals[dayKey].calories += log.calculatedCalories
    })

    let totalPoints = 0
    const dayScores: { date: string, score: number }[] = []

    for (let i = 0; i < daysToTrack; i++) {
      const date = subDays(new Date(), i)
      const dayKey = format(date, 'yyyy-MM-dd')
      const totals = dailyTotals[dayKey] || { protein: 0, calories: 0 }

      let dayPoints = 0
      
      // Protein check (within 15%)
      if (proteinGoal > 0 && totals.protein >= proteinGoal * 0.85 && totals.protein <= proteinGoal * 1.15) {
        dayPoints += 50
      }

      // Calorie check (within 10%)
      if (calorieGoal > 0 && totals.calories >= calorieGoal * 0.9 && totals.calories <= calorieGoal * 1.1) {
        dayPoints += 50
      }

      dayScores.push({ date: dayKey, score: dayPoints })
      totalPoints += dayPoints
    }

    const averageScore = Math.round(totalPoints / daysToTrack)

    return { 
      data: {
        score: averageScore,
        days: dayScores.reverse()
      }
    }
  } catch (e) {
    return { error: 'Failed to calculate consistency' }
  }
}

export async function uploadDailyPhoto(imageUrl: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.dailyPhoto.create({
      data: {
        user_id: user.id,
        image_url: imageUrl,
        notes
      }
    })
    return { success: true }
  } catch (e) {
    return { error: 'Failed to save photo' }
  }
}

export async function getDailyPhotos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  try {
    const photos = await prisma.dailyPhoto.findMany({
      where: { user_id: user.id },
      orderBy: { logged_at: 'desc' },
      take: 12
    })
    return { data: photos }
  } catch (e) {
    return { data: [] }
  }
}
