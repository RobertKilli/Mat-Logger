import { useCockpitStore } from '@/store/cockpitStore'
import { logFoodEntry } from '@/app/(dashboard)/quick-log/actions'
import { logWorkout } from '@/app/(dashboard)/training/actions'

export async function executeLogAction(
  type: 'FOOD' | 'TRAINING',
  payload: Record<string, any>,
  isOnline: boolean
) {
  const store = useCockpitStore.getState()
  const timestamp = new Date().toISOString()

  // 1. Optimistic Update (Store)
  if (type === 'FOOD') {
    const newTotals = {
      protein: store.dailyConsumedProtein + (payload.protein ?? 0),
      carbs: store.dailyConsumedCarbs + (payload.carbs ?? 0),
      fat: store.dailyConsumedFat + (payload.fat ?? 0),
      calories: store.dailyConsumedCalories + (payload.calories ?? 0),
    }
    store.setDailyTotals(newTotals)
  } else if (type === 'TRAINING') {
    const newLogs = [...store.recentWorkoutLogs, { intensity: payload.intensity, logged_at: new Date(timestamp) }]
    store.setWorkoutLogs(newLogs)
  }

  // 2. Network Check
  if (!isOnline) {
    store.addToSyncQueue({ type, payload, timestamp })
    return { success: true, offline: true }
  }

  // 3. Execution
  try {
    let result
    if (type === 'FOOD') {
      result = await logFoodEntry(payload.foodItemId, payload.weightGrams)
    } else {
      const formData = new FormData()
      formData.append('category', payload.category)
      formData.append('duration', payload.duration.toString())
      formData.append('intensity', payload.intensity.toString())
      result = await logWorkout(formData)
    }

    if (result?.error) {
      store.addToSyncQueue({ type, payload, timestamp })
      return { error: result.error }
    }

    return { success: true }
  } catch {
    store.addToSyncQueue({ type, payload, timestamp })
    return { success: true, offline: true }
  }
}

export async function processSyncQueue() {
  const store = useCockpitStore.getState()
  const { pendingSyncQueue, isSyncing, setIsSyncing, removeFromSyncQueue } = store

  if (pendingSyncQueue.length === 0 || isSyncing) return

  setIsSyncing(true)

  try {
    // FIFO processing
    const sortedQueue = [...pendingSyncQueue].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (const action of sortedQueue) {
      let result
      if (action.type === 'FOOD') {
        result = await logFoodEntry(action.payload.foodItemId, action.payload.weightGrams)
      } else if (action.type === 'TRAINING') {
        const formData = new FormData()
        formData.append('category', action.payload.category)
        formData.append('duration', action.payload.duration.toString())
        formData.append('intensity', action.payload.intensity.toString())
        result = await logWorkout(formData)
      }

      if (result?.success) {
        removeFromSyncQueue(action.timestamp)
      } else {
        // Stop on first error to preserve order
        console.error('Sync failed for item:', action.timestamp, result?.error)
        break
      }
    }
  } catch (error) {
    console.error('Sync queue processing error:', error)
  } finally {
    setIsSyncing(false)
  }
}
