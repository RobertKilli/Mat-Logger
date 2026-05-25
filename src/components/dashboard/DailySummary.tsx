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

  const calorieGoal = isHistorical ? 0 : (store.calorieGoal || 2500)
  const proteinGoal = isHistorical ? 0 : (store.proteinGoal || 0)
  
  // Logical targets based on strategy if not explicitly set
  const carbTarget = proteinGoal > 0 ? proteinGoal * 2 : (calorieGoal * 0.45 / 4)
  const fatTarget = proteinGoal > 0 ? proteinGoal * 0.7 : (calorieGoal * 0.25 / 9)
  const pTarget = proteinGoal > 0 ? proteinGoal : (calorieGoal * 0.3 / 4)

  const calorieProgress = calorieGoal > 0 ? (data.calories / calorieGoal) * 100 : 0
  
  // Strategy Color Logic
  const getStatusColor = () => {
    if (isHistorical) return 'text-zinc-500'
    if (store.goal === 'CUT') return calorieProgress > 100 ? 'text-red-500' : 'text-[#00FF41]'
    if (store.goal === 'BULK') return calorieProgress < 90 ? 'text-blue-400' : 'text-[#00FF41]'
    return calorieProgress > 105 ? 'text-yellow-500' : 'text-[#00FF41]'
  }

  const macros = [
    { label: 'Protein', current: data.protein, target: pTarget, unit: 'g', color: 'bg-blue-500' },
    { label: 'Karbs', current: data.carbs, target: carbTarget, unit: 'g', color: 'bg-amber-500' },
    { label: 'Fett', current: data.fat, target: fatTarget, unit: 'g', color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Kalori Cockpit */}
      <div className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Energi_Status ({store.goal})</p>
            <p className={`font-mono text-4xl font-bold ${getStatusColor()} tracking-tighter`}>
              {Math.round(data.calories)}
              <span className="text-sm font-normal text-zinc-600 ml-2">/ {calorieGoal} kcal</span>
            </p>
          </div>
          <div className="text-right hidden sm:block">
             <p className="font-mono text-[10px] text-zinc-500 uppercase">Gjenstår</p>
             <p className="font-mono text-lg font-bold text-white">
               {Math.max(0, calorieGoal - Math.round(data.calories))}
             </p>
          </div>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
           <div 
             className={`h-full transition-all duration-1000 ease-out ${calorieProgress > 100 ? 'bg-red-500' : 'bg-[#00FF41]'} shadow-[0_0_15px_rgba(0,255,65,0.3)]`}
             style={{ width: `${Math.min(calorieProgress, 100)}%` }}
           />
           {calorieProgress > 100 && (
              <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
           )}
        </div>
      </div>

      {/* Makro Fordeling */}
      <div className="grid grid-cols-3 gap-4">
        {macros.map((macro) => {
          const progress = (macro.current / macro.target) * 100
          return (
            <div key={macro.label} className="space-y-3">
              <div className="text-center">
                 <p className="font-mono text-[9px] text-zinc-500 uppercase">{macro.label}</p>
                 <p className="font-mono text-sm font-bold text-white">{Math.round(macro.current)}{macro.unit}</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                 <div 
                   className={`h-full ${macro.color} transition-all duration-700`}
                   style={{ width: `${Math.min(progress, 100)}%` }}
                 />
              </div>
              <p className="text-[8px] font-mono text-zinc-600 text-center uppercase">Mål: {Math.round(macro.target)}</p>
            </div>
          )
        })}
      </div>
      
      {!isHistorical && !proteinGoal && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
           <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-relaxed">
             Optimaliser cockpit for din misjon
           </p>
           <Link href="/settings" className="inline-block mt-2 font-mono text-[9px] text-[#00FF41] underline uppercase font-bold">
              Konfigurer Strategi
           </Link>
        </div>
      )}
    </div>
  )
}
