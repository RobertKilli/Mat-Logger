import { useCockpitStore } from '@/store/cockpitStore'
import { logFoodEntry } from '@/app/(dashboard)/quick-log/actions'
import { logWorkout } from '@/app/(dashboard)/training/actions'
import { calculateNutrition } from '@/lib/metabolism/nutrition'

const MAX_QUEUE_SIZE = 50

export async function executeLogAction(
  type: 'FOOD' | 'TRAINING',
  payload: Record<string, any>,
  isOnline: boolean
) {
  const store = useCockpitStore.getState()
  const timestamp = new Date().toISOString()
  const id = crypto.randomUUID()

  // 1. Optimistic Update (Store)
  if (type === 'FOOD') {
    const calculated = calculateNutrition(payload.foodItem, payload.inputMode, payload.inputAmount)
    const newTotals = {
      protein: store.dailyConsumedProtein + calculated.calculatedProtein,
      carbs: store.dailyConsumedCarbs + calculated.calculatedCarbs,
      fat: store.dailyConsumedFat + calculated.calculatedFat,
      calories: store.dailyConsumedCalories + calculated.calculatedCalories,
    }
    store.setDailyTotals(newTotals)
  } else if (type === 'TRAINING') {
    const newLogs = [...store.recentWorkoutLogs, { intensity: payload.intensity, logged_at: new Date(timestamp) }]
    store.setWorkoutLogs(newLogs)
  }

  // 2. Network Check
  if (!isOnline) {
    if (store.pendingSyncQueue.length >= MAX_QUEUE_SIZE) {
      return { error: 'Sync queue full. Please reconnect to sync data.' }
    }
    store.addToSyncQueue({ id, type, payload, timestamp })
    return { success: true, offline: true }
  }

  // 3. Execution
  try {
    let result
    if (type === 'FOOD') {
      result = await logFoodEntry(
        payload.foodItem.id, 
        payload.inputMode, 
        payload.inputAmount,
        payload.mealType,
        payload.notes
      )
    } else {
      const formData = new FormData()
      formData.append('category', payload.category)
      formData.append('duration', payload.duration.toString())
      formData.append('intensity', payload.intensity.toString())
      result = await logWorkout(formData)
    }

    if (result?.error) {
      if (store.pendingSyncQueue.length >= MAX_QUEUE_SIZE) {
        return { error: result.error }
      }
      store.addToSyncQueue({ id, type, payload, timestamp })
      return { error: result.error }
    }

    return { success: true }
  } catch {
    if (store.pendingSyncQueue.length >= MAX_QUEUE_SIZE) {
      return { success: true, offline: true }
    }
    store.addToSyncQueue({ id, type, payload, timestamp })
    return { success: true, offline: true }
  }
}

export async function processSyncQueue() {
  const store = useCockpitStore.getState()
  const { pendingSyncQueue, isSyncing, setIsSyncing, removeFromSyncQueue, setSyncError } = store

  if (pendingSyncQueue.length === 0 || isSyncing) return

  setIsSyncing(true)
  setSyncError(null)

  try {
    // FIFO processing
    const sortedQueue = [...pendingSyncQueue].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (const action of sortedQueue) {
      let result
      if (action.type === 'FOOD') {
        result = await logFoodEntry(
          action.payload.foodItem.id, 
          action.payload.inputMode, 
          action.payload.inputAmount,
          action.payload.mealType,
          action.payload.notes
        )
      } else if (action.type === 'TRAINING') {
        const formData = new FormData()
        formData.append('category', action.payload.category)
        formData.append('duration', action.payload.duration.toString())
        formData.append('intensity', action.payload.intensity.toString())
        result = await logWorkout(formData)
      }

      if (result?.success) {
        removeFromSyncQueue(action.id)
      } else if (result?.status === 400) {
        // Permanent validation error: remove from queue to avoid head-of-line blocking
        console.error('Permanent sync failure (400) for item:', action.id, result?.error)
        removeFromSyncQueue(action.id)
      } else {
        // Stop on first transient error to preserve order
        console.error('Sync failed for item:', action.id, result?.error)
        setSyncError(result?.error || 'Sync failed')
        break
      }
    }
  } catch (error) {
    console.error('Sync queue processing error:', error)
    setSyncError('Internal sync error')
  } finally {
    setIsSyncing(false)
  }
}
