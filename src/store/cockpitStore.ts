import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calculateGlycogenState } from '@/lib/metabolism/glycogen'
import { calculateCNSFatigue } from '@/lib/metabolism/recovery'
import { syncBiometrics } from '@/lib/biometry/sync'

interface PreviewData {
  protein: number
  carbs: number
  fat: number
  calories: number
  intensity: number | null
}

interface PendingAction {
  id: string
  type: 'FOOD' | 'TRAINING'
  payload: Record<string, any>
  timestamp: string
}

interface DailyFoodLog {
  id: string
  name: string
  weight: number
  calories: number
  time: string
}

interface MealBuilderItem {
  id: string
  foodItem: {
    id: string
    name: string
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    caloriesPer100g: number
    baseAmount: number
    baseUnit: string
    gramsPerUnit: number | null
    servingSize: number | null
    servingUnit: string | null
  }
  inputMode: string
  inputAmount: number
}

interface CockpitState {
  weight: number | null
  proteinGoal: number
  calorieGoal: number
  goal: 'CUT' | 'MAINTAIN' | 'BULK'
  language: 'NB' | 'EN'
  dailyConsumedProtein: number
  dailyConsumedCarbs: number
  dailyConsumedFat: number
  dailyConsumedCalories: number
  dailyFoodLogs: DailyFoodLog[]
  recentWorkoutLogs: { intensity: number; logged_at: Date }[]
  glycogenLevel: number // 0-100
  cnsFatigue: number // 0-100
  cnsRecoveryHours: number
  lastMealTime: string | null
  nextMealTime: string | null
  preview: PreviewData | null
  pendingSyncQueue: PendingAction[]
  mealBuilderQueue: MealBuilderItem[]
  isSyncing: boolean
  syncError: string | null
  
  // Empirical Biometrics
  hrv: number | null
  rhr: number | null
  activeCalories: number | null
  
  setBaseline: (data: { 
    weight: number | null, 
    proteinGoal: number, 
    calorieGoal?: number, 
    goal?: 'CUT' | 'MAINTAIN' | 'BULK',
    language?: 'NB' | 'EN'
  }) => void
  setDailyTotals: (totals: {
    protein: number
    carbs: number
    fat: number
    calories: number
    recentLogs?: DailyFoodLog[]
    proteinGoal?: number
    calorieGoal?: number
    goal?: 'CUT' | 'MAINTAIN' | 'BULK'
    language?: 'NB' | 'EN'
  }) => void
  setWorkoutLogs: (logs: { intensity: number; logged_at: Date }[]) => void
  setPreview: (data: Partial<PreviewData> | null) => void
  addToSyncQueue: (action: PendingAction) => void
  removeFromSyncQueue: (id: string) => void
  addToMealBuilder: (item: MealBuilderItem) => void
  removeFromMealBuilder: (id: string) => void
  clearMealBuilder: () => void
  setIsSyncing: (isSyncing: boolean) => void
  setSyncError: (error: string | null) => void
  syncHealthData: () => Promise<void>
  updateMetabolicState: () => void
  updateGlycogen: (level: number) => void
  updateCNS: (level: number) => void
}

export const useCockpitStore = create<CockpitState>()(
  persist(
    (set, get) => ({
      weight: null,
      proteinGoal: 0,
      calorieGoal: 2500,
      goal: 'MAINTAIN',
      language: 'NB',
      dailyConsumedProtein: 0,
      dailyConsumedCarbs: 0,
      dailyConsumedFat: 0,
      dailyConsumedCalories: 0,
      dailyFoodLogs: [],
      recentWorkoutLogs: [],
      glycogenLevel: 100,
      cnsFatigue: 0,
      cnsRecoveryHours: 0,
      lastMealTime: null,
      nextMealTime: null,
      preview: null,
      pendingSyncQueue: [],
      mealBuilderQueue: [],
      isSyncing: false,
      syncError: null,
      hrv: null,
      rhr: null,
      activeCalories: null,
      
      setBaseline: (data) => {
        set({ 
          weight: data.weight, 
          proteinGoal: data.proteinGoal,
          calorieGoal: data.calorieGoal ?? get().calorieGoal,
          goal: data.goal ?? get().goal,
          language: data.language ?? get().language
        })
        get().updateMetabolicState()
      },
      setDailyTotals: (totals) => {
        set({
          dailyConsumedProtein: totals.protein,
          dailyConsumedCarbs: totals.carbs,
          dailyConsumedFat: totals.fat,
          dailyConsumedCalories: totals.calories,
          dailyFoodLogs: totals.recentLogs ?? get().dailyFoodLogs,
          proteinGoal: totals.proteinGoal ?? get().proteinGoal,
          calorieGoal: totals.calorieGoal ?? get().calorieGoal,
          goal: totals.goal ?? get().goal,
          language: totals.language ?? get().language,
        })
        get().updateMetabolicState()
      },
      setWorkoutLogs: (logs) => {
        set({ recentWorkoutLogs: logs })
        get().updateMetabolicState()
      },
      setPreview: (data) => {
        if (data === null) {
          set({ preview: null })
        } else {
          set({
            preview: {
              protein: data.protein ?? 0,
              carbs: data.carbs ?? 0,
              fat: data.fat ?? 0,
              calories: data.calories ?? 0,
              intensity: data.intensity ?? null,
            }
          })
        }
      },
      addToSyncQueue: (action) => {
        set((state) => {
          if (state.pendingSyncQueue.length >= 50) return state
          return {
            pendingSyncQueue: [...state.pendingSyncQueue, action]
          }
        })
      },
      removeFromSyncQueue: (id) => {
        set((state) => ({
          pendingSyncQueue: state.pendingSyncQueue.filter(a => a.id !== id)
        }))
      },
      addToMealBuilder: (item) => {
        set((state) => ({
          mealBuilderQueue: [...state.mealBuilderQueue, item]
        }))
      },
      removeFromMealBuilder: (id) => {
        set((state) => ({
          mealBuilderQueue: state.mealBuilderQueue.filter(i => i.id !== id)
        }))
      },
      clearMealBuilder: () => set({ mealBuilderQueue: [] }),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setSyncError: (syncError) => set({ syncError }),
      syncHealthData: async () => {
        set({ isSyncing: true, syncError: null })
        try {
          const result = await syncBiometrics()
          // Update local state with latest values if available from the result
          if (result && result.latestData) {
             set({
               hrv: result.latestData.hrv ?? get().hrv,
               rhr: result.latestData.rhr ?? get().rhr,
               activeCalories: result.latestData.activeCalories ?? get().activeCalories,
             })
          }
          set({ isSyncing: false })
          get().updateMetabolicState()
        } catch (error: any) {
          set({ isSyncing: false, syncError: error.message })
        }
      },
      updateMetabolicState: () => {
        const { weight, dailyConsumedCarbs, recentWorkoutLogs, dailyFoodLogs, hrv, activeCalories } = get()
        
        // 1. Glycogen Update (Augmented by empirical active calories)
        if (weight) {
          const now = new Date()
          const hoursToday = now.getHours() + now.getMinutes() / 60
          const glycogen = calculateGlycogenState(
            weight, 
            dailyConsumedCarbs, 
            hoursToday, 
            activeCalories ?? undefined
          )
          set({ glycogenLevel: glycogen.percentage })
        }

        // 2. CNS Update (Augmented by empirical HRV)
        if (recentWorkoutLogs && recentWorkoutLogs.length > 0) {
          const cns = calculateCNSFatigue(recentWorkoutLogs, hrv ?? undefined)
          set({ cnsFatigue: cns.percentage, cnsRecoveryHours: cns.recoveryTimeHours })
        } else {
          set({ cnsFatigue: 0, cnsRecoveryHours: 0 })
        }

        // 3. Meal Timing Update
        if (dailyFoodLogs.length > 0) {
          const sortedLogs = [...dailyFoodLogs].sort((a, b) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          const lastMeal = sortedLogs[0]
          const lastTime = new Date(lastMeal.time)
          const nextTime = new Date(lastTime.getTime() + 4 * 60 * 60 * 1000) // 4 hours later
          
          set({ 
            lastMealTime: lastTime.toISOString(),
            nextMealTime: nextTime.toISOString()
          })
        } else {
          set({ lastMealTime: null, nextMealTime: null })
        }
      },
      updateGlycogen: (level) => set({ glycogenLevel: level }),
      updateCNS: (level) => set({ cnsFatigue: level }),
    }),
    {
      name: 'cockpit-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        weight: state.weight,
        proteinGoal: state.proteinGoal,
        calorieGoal: state.calorieGoal,
        goal: state.goal,
        language: state.language,
        dailyConsumedProtein: state.dailyConsumedProtein,
        dailyConsumedCarbs: state.dailyConsumedCarbs,
        dailyConsumedFat: state.dailyConsumedFat,
        dailyConsumedCalories: state.dailyConsumedCalories,
        dailyFoodLogs: state.dailyFoodLogs,
        glycogenLevel: state.glycogenLevel,
        cnsFatigue: state.cnsFatigue,
        cnsRecoveryHours: state.cnsRecoveryHours,
        lastMealTime: state.lastMealTime,
        nextMealTime: state.nextMealTime,
        pendingSyncQueue: state.pendingSyncQueue,
        mealBuilderQueue: state.mealBuilderQueue,
        recentWorkoutLogs: state.recentWorkoutLogs,
        hrv: state.hrv,
        rhr: state.rhr,
        activeCalories: state.activeCalories,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.recentWorkoutLogs) {
          state.recentWorkoutLogs = state.recentWorkoutLogs.map(log => ({
            ...log,
            logged_at: new Date(log.logged_at)
          }))
        }
      }
    }
  )
)
