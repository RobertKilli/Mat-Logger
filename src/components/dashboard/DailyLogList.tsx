'use client'

import { useState } from 'react'
import { deleteFoodLog } from '@/app/(dashboard)/quick-log/actions'
import { format } from 'date-fns'
import { InputMode, MealType } from '@prisma/client'

interface LogEntry {
  id: string
  name: string
  weight: number
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  mealType: MealType | null
  inputMode: InputMode
  inputAmount: number
}

interface DailyLogListProps {
  logs: LogEntry[]
  isHistorical?: boolean
}

export default function DailyLogList({ logs, isHistorical }: DailyLogListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  async function handleDeleteLog(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne loggføringen?')) return
    
    setIsDeleting(id)
    const result = await deleteFoodLog(id)
    if (!result.success) {
      alert(result.error)
    }
    setIsDeleting(null)
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl bg-[#141416] overflow-hidden ring-1 ring-white/10 shadow-lg">
        <div className="p-12 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center mb-3">
             <div className="h-1 w-1 rounded-full bg-zinc-700" />
          </div>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-tighter">
            Ingen aktive operasjoner registrert
          </p>
        </div>
      </div>
    )
  }

  const groupedLogs = logs.reduce((acc, log) => {
    const meal = log.mealType || 'OTHER'
    if (!acc[meal]) acc[meal] = []
    acc[meal].push(log)
    return acc
  }, {} as Record<string, LogEntry[]>)

  const mealOrder: (MealType | 'OTHER')[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']
  const mealLabels: Record<string, string> = {
    BREAKFAST: 'Frokost',
    LUNCH: 'Lunsj',
    DINNER: 'Middag',
    SNACK: 'Mellommåltid',
    OTHER: 'Annet'
  }

  return (
    <div className="space-y-6">
      {mealOrder.map(meal => {
        const mealLogs = groupedLogs[meal]
        if (!mealLogs || mealLogs.length === 0) return null

        const mealCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0)

        return (
          <div key={meal} className="rounded-2xl bg-[#141416] overflow-hidden ring-1 ring-white/10 shadow-lg">
            <div className="bg-white/[0.02] border-b border-white/5 px-4 py-3 flex justify-between items-center">
              <h3 className="font-mono text-xs font-bold text-white uppercase">{mealLabels[meal]}</h3>
              <span className="font-mono text-[10px] text-zinc-500">{mealCalories} KCAL</span>
            </div>
            <div className="divide-y divide-white/5">
              {mealLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group text-white">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-sm text-zinc-200 truncate">{log.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[9px] text-zinc-500 uppercase">
                        {format(new Date(log.time), 'HH:mm')} • {log.inputAmount}{log.inputMode === 'GRAMS' ? 'g' : 'stk'}
                      </span>
                      <div className="flex gap-2 font-mono text-[8px] text-zinc-600">
                         <span>P: {log.protein}g</span>
                         <span>K: {log.carbs}g</span>
                         <span>F: {log.fat}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#00FF41]">+{log.calories} KCAL</span>
                    </div>
                    {!isHistorical && (
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={isDeleting === log.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-red-500 disabled:opacity-50"
                        aria-label="Slett loggføring"
                      >
                        {isDeleting === log.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-red-500 border-t-transparent" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
