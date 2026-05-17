import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calculateGlycogenState } from '@/lib/metabolism/glycogen'
import { calculateCNSFatigue } from '@/lib/metabolism/recovery'

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

interface CockpitState {
  weight: number | null
  proteinGoal: number
  dailyConsumedProtein: number
  dailyConsumedCarbs: number
  dailyConsumedFat: number
  dailyConsumedCalories: number
  glycogenLevel: number // 0-100
  cnsFatigue: number // 0-100
  cnsRecoveryHours: number
  preview: PreviewData | null
  pendingSyncQueue: PendingAction[]
  isSyncing: boolean
  syncError: string | null
  
  setBaseline: (weight: number | null, proteinGoal: number) => void
  setDailyTotals: (totals: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }) => void
  setWorkoutLogs: (logs: { intensity: number; logged_at: Date }[]) => void
  setPreview: (data: Partial<PreviewData> | null) => void
  addToSyncQueue: (action: PendingAction) => void
  removeFromSyncQueue: (id: string) => void
  setIsSyncing: (isSyncing: boolean) => void
  setSyncError: (error: string | null) => void
  updateMetabolicState: () => void
  updateGlycogen: (level: number) => void
  updateCNS: (level: number) => void
}

export const useCockpitStore = create<CockpitState>()(
  persist(
    (set, get) => ({
      weight: null,
      proteinGoal: 0,
      dailyConsumedProtein: 0,
      dailyConsumedCarbs: 0,
      dailyConsumedFat: 0,
      dailyConsumedCalories: 0,
      glycogenLevel: 100,
      cnsFatigue: 0,
      cnsRecoveryHours: 0,
      preview: null,
      pendingSyncQueue: [],
      isSyncing: false,
      syncError: null,
      recentWorkoutLogs: [] as { intensity: number; logged_at: Date }[],
      
      setBaseline: (weight, proteinGoal) => {
        set({ weight, proteinGoal })
        get().updateMetabolicState()
      },
      setDailyTotals: (totals) => {
        set({
          dailyConsumedProtein: totals.protein,
          dailyConsumedCarbs: totals.carbs,
          dailyConsumedFat: totals.fat,
          dailyConsumedCalories: totals.calories,
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
        set((state) => ({
          pendingSyncQueue: [...state.pendingSyncQueue, action]
        }))
      },
      removeFromSyncQueue: (id) => {
        set((state) => ({
          pendingSyncQueue: state.pendingSyncQueue.filter(a => a.id !== id)
        }))
      },
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setSyncError: (syncError) => set({ syncError }),
      updateMetabolicState: () => {
        const { weight, dailyConsumedCarbs, recentWorkoutLogs } = get()
        
        // 1. Glycogen Update
        if (weight) {
          const now = new Date()
          const hoursToday = now.getHours() + now.getMinutes() / 60
          const glycogen = calculateGlycogenState(weight, dailyConsumedCarbs, hoursToday)
          set({ glycogenLevel: glycogen.percentage })
        }

        // 2. CNS Update
        if (recentWorkoutLogs.length > 0) {
          const cns = calculateCNSFatigue(recentWorkoutLogs)
          set({ cnsFatigue: cns.percentage, cnsRecoveryHours: cns.recoveryTimeHours })
        } else {
          set({ cnsFatigue: 0, cnsRecoveryHours: 0 })
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
        dailyConsumedProtein: state.dailyConsumedProtein,
        dailyConsumedCarbs: state.dailyConsumedCarbs,
        dailyConsumedFat: state.dailyConsumedFat,
        dailyConsumedCalories: state.dailyConsumedCalories,
        glycogenLevel: state.glycogenLevel,
        cnsFatigue: state.cnsFatigue,
        cnsRecoveryHours: state.cnsRecoveryHours,
        pendingSyncQueue: state.pendingSyncQueue,
        recentWorkoutLogs: state.recentWorkoutLogs,
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
