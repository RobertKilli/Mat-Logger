'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useEffect, useState } from 'react'

export default function MealTimer() {
  const { lastMealTime, nextMealTime } = useCockpitStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  if (!lastMealTime || !nextMealTime) {
    return (
      <div className="rounded-2xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-lg flex flex-col items-center justify-center text-center">
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Måltidsstatus</p>
        <p className="font-mono text-xs text-zinc-400">Ingen måltider logget i dag</p>
      </div>
    )
  }

  const lastTime = parseISO(lastMealTime)
  const nextTime = parseISO(nextMealTime)
  const isPastNextMeal = isAfter(now, nextTime)

  return (
    <div className="rounded-2xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent group-hover:via-[#00FF41]/50" />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Forrige Måltid</p>
          <span className="font-mono text-[10px] text-white">
            {formatDistanceToNow(lastTime, { addSuffix: true, locale: nb })}
          </span>
        </div>

        <div className="flex flex-col items-center py-2">
          <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-[0.2em] mb-2">Neste anbefalte vindu</p>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono text-2xl font-bold tracking-tighter ${isPastNextMeal ? 'text-red-500 animate-pulse' : 'text-[#00FF41]'}`}>
              {isPastNextMeal ? 'NÅ' : formatDistanceToNow(nextTime, { locale: nb })}
            </span>
            {!isPastNextMeal && <span className="font-mono text-[10px] text-zinc-500 lowercase">igjen</span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="font-mono text-[7px] text-zinc-600 uppercase">Optimalt vindu: 4t intervall</span>
          <div className={`h-1.5 w-1.5 rounded-full ${isPastNextMeal ? 'bg-red-500 animate-ping' : 'bg-[#00FF41]'}`} />
        </div>
      </div>
    </div>
  )
}
