'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useCockpitStore } from '@/store/cockpitStore'
import { processSyncQueue } from '@/lib/metabolism/syncService'
import { useEffect, useState } from 'react'

export default function SyncStatus() {
  const isOnline = useOnlineStatus()
  const pendingCount = useCockpitStore((state) => state.pendingSyncQueue.length)
  const isSyncing = useCockpitStore((state) => state.isSyncing)
  const syncError = useCockpitStore((state) => state.syncError)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      processSyncQueue()
    }
  }, [isOnline, pendingCount, isSyncing])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-4" role="status" aria-live="polite">
      {syncError && (
        <div 
          className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 ring-1 ring-red-500/20"
          aria-label={`Synchronization failed: ${syncError}`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
          <span className="font-mono text-[9px] font-bold text-red-500 uppercase tracking-tighter">
            Sync failed: {syncError}
          </span>
        </div>
      )}

      {!isOnline && !syncError && (
        <div 
          className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 ring-1 ring-red-500/20"
          aria-label="System is currently offline"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[9px] font-bold text-red-500 uppercase tracking-tighter">
            Offline Mode
          </span>
        </div>
      )}

      {isSyncing && (
        <div 
          className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 ring-1 ring-blue-500/20"
          aria-label="Synchronizing data with cloud"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-spin" aria-hidden="true" />
          <span className="font-mono text-[9px] font-bold text-blue-500 uppercase tracking-tighter">
            Syncing...
          </span>
        </div>
      )}

      {!isSyncing && pendingCount > 0 && (
        <div 
          className="flex items-center gap-1.5 rounded-full bg-[#00FF41]/10 px-3 py-1 ring-1 ring-[#00FF41]/20"
          aria-label={`${pendingCount} items waiting to be saved`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[#00FF41] animate-bounce" aria-hidden="true" />
          <span className="font-mono text-[9px] font-bold text-[#00FF41] uppercase tracking-tighter">
            {pendingCount} Pending Sync
          </span>
        </div>
      )}
    </div>
  )
}
