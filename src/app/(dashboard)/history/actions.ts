'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, format } from 'date-fns'

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
      select: { protein_goal: true }
    })

    const proteinGoal = user?.protein_goal || 0

    // Fetch all logs
    const [workouts, foodLogs] = await Promise.all([
      prisma.workoutLog.findMany({
        where: { user_id: authUser.id },
        include: {
          workout_exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { logged_at: 'desc' },
      }),
      prisma.foodLog.findMany({
        where: { user_id: authUser.id },
        orderBy: { logged_at: 'desc' },
      })
    ])

    // Group by day
    const historyMap: Record<string, {
      date: string
      workouts: any[]
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

    // Process food logs first to establish days and totals
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

    // Add workouts to the map
    workouts.forEach(workout => {
      const dayKey = format(startOfDay(new Date(workout.logged_at)), 'yyyy-MM-dd')
      if (!historyMap[dayKey]) {
        historyMap[dayKey] = {
          date: dayKey,
          workouts: [],
          food: { protein: 0, carbs: 0, fat: 0, calories: 0, logs: [] },
          isDeficient: false,
          deficiencyReason: null
        }
      }
      
      // Calculate total volume for this workout
      const totalVolume = workout.workout_exercises.reduce((sum, ex) => {
        return sum + (ex.sets * ex.reps * (ex.weight || 0))
      }, 0)

      historyMap[dayKey].workouts.push({
        ...workout,
        totalVolume: Math.round(totalVolume)
      })
    })

    // Analyze deficiencies
    Object.values(historyMap).forEach(day => {
      if (proteinGoal > 0 && day.food.protein < proteinGoal) {
        day.isDeficient = true
        day.deficiencyReason = `Manko på protein: ${Math.round(proteinGoal - day.food.protein)}g gjenstår`
      }
    })

    // Convert to sorted array
    const sortedHistory = Object.values(historyMap).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return { 
      data: sortedHistory,
      proteinGoal
    }
  } catch (e) {
    console.error('Error fetching unified history:', e)
    return { error: 'Failed to retrieve operational history' }
  }
}
