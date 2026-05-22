'use client'

import { format, parseISO, isToday } from 'date-fns'
import { nb } from 'date-fns/locale'

interface UnifiedHistoryProps {
  history: {
    date: string
    workouts: {
      id: string
      category: string
      duration_minutes: number
      intensity: number
      logged_at: Date
    }[]
    food: {
      protein: number
      carbs: number
      fat: number
      calories: number
    }
    isDeficient: boolean
    deficiencyReason: string | null
  }[]
  proteinGoal: number
}

export default function UnifiedHistory({ history, proteinGoal }: UnifiedHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-xs uppercase text-zinc-600 tracking-widest text-balance">
          Ingen operative data funnet i loggen
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {history.map((day) => {
        const dateObj = parseISO(day.date)
        const dayLabel = isToday(dateObj) ? 'I DAG' : format(dateObj, 'eeee d. MMMM', { locale: nb }).toUpperCase()
        
        return (
          <div key={day.date} className="space-y-4">
            {/* Day Header */}
            <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
               <h2 className="font-mono text-xs font-bold text-[#00FF41] tracking-[0.2em]">
                 {dayLabel}
               </h2>
               <span className="font-mono text-[10px] text-zinc-600">
                 DATE_REF: {day.date}
               </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Nutrition Summary Card */}
              <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg relative overflow-hidden">
                {day.isDeficient && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-red-500/10 text-red-500 text-[8px] font-bold px-3 py-1 uppercase tracking-tighter">
                      Manko Oppdaget
                    </div>
                  </div>
                )}
                
                <h3 className="font-mono text-[10px] uppercase text-zinc-500 mb-4 tracking-widest">Drivstoff-Status</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                   <div className="space-y-1">
                      <p className="font-mono text-2xl font-bold text-white">{Math.round(day.food.calories)}</p>
                      <p className="font-mono text-[8px] text-zinc-600 uppercase">Kcal Inntak</p>
                   </div>
                   <div className="space-y-1">
                      <p className={`font-mono text-2xl font-bold ${day.isDeficient ? 'text-red-500' : 'text-[#00FF41]'}`}>
                        {Math.round(day.food.protein)}g
                      </p>
                      <p className="font-mono text-[8px] text-zinc-600 uppercase">
                        Protein {proteinGoal > 0 && `(Mål: ${proteinGoal}g)`}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-zinc-300">{Math.round(day.food.carbs)}g</p>
                      <p className="font-mono text-[8px] text-zinc-600 uppercase">Karbs</p>
                   </div>
                   <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-zinc-300">{Math.round(day.food.fat)}g</p>
                      <p className="font-mono text-[8px] text-zinc-600 uppercase">Fett</p>
                   </div>
                </div>

                {day.isDeficient && day.deficiencyReason && (
                   <div className="mt-6 pt-4 border-t border-red-500/10">
                      <p className="font-mono text-[9px] text-red-400 uppercase leading-relaxed">
                         ⚠️ {day.deficiencyReason}
                      </p>
                   </div>
                )}
              </div>

              {/* Workout List Card */}
              <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg">
                <h3 className="font-mono text-[10px] uppercase text-zinc-500 mb-4 tracking-widest">Misjons-Logger</h3>
                {day.workouts.length > 0 ? (
                  <div className="space-y-3">
                    {day.workouts.map((w) => (
                      <div key={w.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 ring-1 ring-white/5">
                        <div>
                          <p className="font-mono text-[10px] font-bold text-[#00FF41]">{w.category}</p>
                          <p className="text-[9px] text-zinc-600">{format(new Date(w.logged_at), 'HH:mm')}</p>
                        </div>
                        <div className="flex gap-4 text-right">
                           <div>
                              <p className="font-mono text-xs font-bold text-white">{w.duration_minutes}</p>
                              <p className="text-[7px] text-zinc-600 uppercase">Min</p>
                           </div>
                           <div>
                              <p className="font-mono text-xs font-bold text-white">{w.intensity}/10</p>
                              <p className="text-[7px] text-zinc-600 uppercase">Load</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
                    <p className="font-mono text-[9px] text-zinc-700 uppercase">Ingen økter logget</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
