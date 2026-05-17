'use client'

import { useCockpitStore } from '@/store/cockpitStore'

export default function DailySummary() {
  const { 
    proteinGoal, 
    dailyConsumedProtein,
    dailyConsumedCarbs,
    dailyConsumedFat,
    dailyConsumedCalories
  } = useCockpitStore()

  const macros = [
    { 
      label: 'Protein', 
      current: dailyConsumedProtein, 
      target: proteinGoal, 
      color: 'bg-[#00FF41]', 
      unit: 'g' 
    },
    { 
      label: 'Carbs', 
      current: dailyConsumedCarbs, 
      target: 0, // No specific target yet in baseline
      color: 'bg-zinc-400', 
      unit: 'g' 
    },
    { 
      label: 'Fat', 
      current: dailyConsumedFat, 
      target: 0, 
      color: 'bg-zinc-400', 
      unit: 'g' 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="font-mono text-[10px] uppercase text-zinc-500">Daily Calories</p>
          <p className="font-mono text-3xl font-bold text-[#00FF41]">
            {dailyConsumedCalories} <span className="text-sm font-normal text-zinc-600">kcal</span>
          </p>
        </div>
        
        {/* Quick status card */}
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 flex items-center justify-center">
          <div className="text-center">
             <p className="font-mono text-[10px] uppercase text-zinc-500 underline decoration-[#00FF41]">System Status</p>
             <p className="font-mono text-xs font-bold text-white mt-1">OPERATIONAL</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {macros.map((macro) => (
          <div key={macro.label} className="space-y-2">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              <span>{macro.label}</span>
              <span className="text-white">
                {macro.current.toFixed(1)}{macro.unit} 
                {macro.target > 0 && ` / ${macro.target}${macro.unit}`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/5">
              {macro.target > 0 ? (
                <div 
                  className={`h-full ${macro.color} transition-all duration-500`}
                  style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                />
              ) : (
                <div 
                  className="h-full bg-zinc-700"
                  style={{ width: '10%' }} // Indicator that it's being tracked but no target
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
