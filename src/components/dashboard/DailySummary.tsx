'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import Link from 'next/link'

interface DailySummaryProps {
  serverData?: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }
  isHistorical?: boolean
}

export default function DailySummary({ serverData, isHistorical }: DailySummaryProps) {
  const store = useCockpitStore()

  // Prioritize server data if it's a historical date, otherwise use live store state
  const data = isHistorical && serverData ? serverData : {
    protein: store.dailyConsumedProtein,
    carbs: store.dailyConsumedCarbs,
    fat: store.dailyConsumedFat,
    calories: store.dailyConsumedCalories
  }

  // Use a visual fallback if no goal is set, to demonstrate the color logic
  const proteinGoal = isHistorical ? 0 : (store.proteinGoal || 0)
  
  // If no goal is set, we use a standard baseline (150g) just for the UI meter if it's live
  const displayGoal = proteinGoal > 0 ? proteinGoal : (isHistorical ? 0 : 150)

  const macros = [
    { 
      label: 'Protein', 
      current: data.protein, 
      target: displayGoal, 
      isConfigured: proteinGoal > 0,
      unit: 'g' 
    },
    { 
      label: 'Karbs', 
      current: data.carbs, 
      target: isHistorical ? 0 : (proteinGoal > 0 ? proteinGoal * 1.5 : 200), // Estimated for UI logic
      isConfigured: proteinGoal > 0,
      unit: 'g' 
    },
    { 
      label: 'Fett', 
      current: data.fat, 
      target: isHistorical ? 0 : (proteinGoal > 0 ? proteinGoal * 0.5 : 70),  // Estimated for UI logic
      isConfigured: proteinGoal > 0,
      unit: 'g' 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00FF41]/30 to-transparent" />
          <p className="font-mono text-[10px] uppercase text-zinc-500">Daglig Inntak</p>
          <p className="font-mono text-3xl font-bold text-[#00FF41]">
            {Math.round(data.calories)} <span className="text-sm font-normal text-zinc-600">kcal</span>
          </p>
        </div>
        
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 flex items-center justify-center">
          <div className="text-center">
             <p className="font-mono text-[10px] uppercase text-zinc-500 underline decoration-[#00FF41] underline-offset-4">System Status</p>
             <p className="font-mono text-[10px] font-bold text-white mt-2 tracking-tighter uppercase">
               {isHistorical ? 'Historical_Record' : 'Live_Operations'}
             </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {macros.map((macro) => {
          const progress = macro.target > 0 ? (macro.current / macro.target) * 100 : 0
          
          // CRITICAL LOGIC: 
          // Red if under 90% (underskudd)
          // Green if 90% or more (mot total)
          const isCritical = macro.target > 0 && progress < 90
          const isHealthy = macro.target > 0 && progress >= 90

          const barColor = isCritical ? 'bg-red-600' : (isHealthy ? 'bg-[#00FF41]' : 'bg-zinc-800')
          const barGlow = isCritical 
            ? 'shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : (isHealthy ? 'shadow-[0_0_12px_rgba(0,255,65,0.4)]' : '')

          return (
            <div key={macro.label} className="space-y-2">
              <div className="flex justify-between items-baseline font-mono text-[10px] uppercase">
                <span className={isCritical ? 'text-red-500 animate-pulse font-bold' : 'text-zinc-500'}>
                  {macro.label}{isCritical ? '_UNDER_TARGET' : ''}
                </span>
                <div className="flex gap-2 items-baseline">
                   <span className="text-zinc-300 font-bold text-xs">{macro.current.toFixed(1)}{macro.unit}</span>
                   {macro.target > 0 && (
                     <span className="text-zinc-600 text-[8px]">/ {Math.round(macro.target)}{macro.unit}</span>
                   )}
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/5">
                {macro.target > 0 ? (
                  <div 
                    className={`h-full ${barColor} ${barGlow} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                ) : (
                  <div 
                    className="h-full bg-zinc-900/50"
                    style={{ width: macro.current > 0 ? '100%' : '0%' }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {!isHistorical && !store.proteinGoal && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
           <p className="font-mono text-[9px] text-yellow-500 uppercase tracking-widest leading-relaxed">
             Ingen pilot-mål er satt. Viser standard baseline.
           </p>
           <Link href="/profile" className="inline-block mt-2 font-mono text-[8px] text-white underline hover:text-[#00FF41]">
              KONFIGURR BASALSTOFFSKIFTE
           </Link>
        </div>
      )}

      {macros.some(m => m.target > 0 && (m.current / m.target) < 0.9) && !isHistorical && (
         <div className="pt-2">
            <p className="font-mono text-[8px] text-red-500 uppercase text-center tracking-[0.2em] animate-pulse font-bold">
              Kritisk underskudd detektert i cockpit
            </p>
         </div>
      )}
    </div>
  )
}
