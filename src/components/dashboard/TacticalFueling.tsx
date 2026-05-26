'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useCockpitStore } from '@/store/cockpitStore'
import { useI18n } from '@/hooks/useI18n'
import { format, differenceInMinutes } from 'date-fns'

export default function TacticalFueling() {
  const { t } = useI18n()
  const { permission, requestPermission, isSupported } = usePushNotifications()
  const { nextMealTime, lastMealTime } = useCockpitStore()

  if (!isSupported) return null

  const now = new Date()
  const nextTime = nextMealTime ? new Date(nextMealTime) : null
  const diffMinutes = nextTime ? differenceInMinutes(nextTime, now) : 0
  
  const isWindowOpen = diffMinutes <= 0 && nextTime !== null
  const isEnabled = permission === 'granted'

  return (
    <div className={`rounded-2xl p-6 ring-1 transition-all ${isWindowOpen ? 'bg-orange-500/10 ring-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white/5 ring-white/10'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${isWindowOpen ? 'bg-orange-500 text-black animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
            {isWindowOpen ? '!' : '○'}
          </div>
          <div>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Fueling_Protocol</h3>
            <p className="font-mono text-xs font-black text-white uppercase">
              {isWindowOpen ? 'REFUELING_WINDOW_OPEN' : 'SYSTEM_STABILIZED'}
            </p>
          </div>
        </div>
        
        {!isEnabled && (
          <button 
            onClick={() => requestPermission()}
            className="font-mono text-[8px] font-bold text-[#00FF41] border border-[#00FF41]/30 px-3 py-1.5 rounded-full hover:bg-[#00FF41]/10 transition-all"
          >
            ACTIVATE_ALERTS
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
         <div>
            <p className="font-mono text-[8px] text-zinc-600 uppercase mb-1">Last Intake</p>
            <p className="font-mono text-sm font-bold text-zinc-300">
              {lastMealTime ? format(new Date(lastMealTime), 'HH:mm') : 'NO_DATA'}
            </p>
         </div>
         <div className="text-right">
            <p className="font-mono text-[8px] text-zinc-600 uppercase mb-1">Next Window</p>
            <p className={`font-mono text-sm font-bold ${isWindowOpen ? 'text-orange-500' : 'text-[#00FF41]'}`}>
              {nextTime ? format(nextTime, 'HH:mm') : 'STANDBY'}
            </p>
         </div>
      </div>

      {isWindowOpen && (
        <p className="mt-4 font-mono text-[9px] text-orange-400 uppercase leading-relaxed italic">
          ⚠️ Kritisk: Aminosyre-nivåer synkende. Nitrogen-balanse i fare.
        </p>
      )}
    </div>
  )
}
