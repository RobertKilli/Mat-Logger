'use client'

import { useEffect } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'

interface HydrateCockpitProps {
  baseline: {
    weight: number | null
    proteinGoal: number
  }
  dailyTotals: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }
  recentWorkouts: { intensity: number; logged_at: Date }[]
}

export default function HydrateCockpit({ 
  baseline, 
  dailyTotals, 
  recentWorkouts 
}: HydrateCockpitProps) {
  const setBaseline = useCockpitStore((state) => state.setBaseline)
  const setDailyTotals = useCockpitStore((state) => state.setDailyTotals)
  const setWorkoutLogs = useCockpitStore((state) => state.setWorkoutLogs)

  useEffect(() => {
    setBaseline(baseline.weight, baseline.proteinGoal)
    setDailyTotals(dailyTotals)
    setWorkoutLogs(recentWorkouts)
  }, [baseline, dailyTotals, recentWorkouts, setBaseline, setDailyTotals, setWorkoutLogs])

  return null
}
