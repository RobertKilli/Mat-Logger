'use client'

import { format } from 'date-fns'

interface WorkoutHistoryProps {
  logs: {
    id: string
    category: 'PUSH' | 'PULL' | 'LEGS'
    duration_minutes: number
    intensity: number
    logged_at: Date
  }[]
}

export default function WorkoutHistory({ logs }: WorkoutHistoryProps) {
  if (logs.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-xs uppercase text-zinc-600 tracking-widest">
          No missions recorded yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        // CNS Color mapping
        let intensityColor = 'text-[#00FF41]' // Green
        if (log.intensity > 7) intensityColor = 'text-[#EF4444]' // Red
        else if (log.intensity > 3) intensityColor = 'text-[#F59E0B]' // Orange

        return (
          <div
            key={log.id}
            className="flex items-center justify-between rounded-xl bg-[#141416] p-5 ring-1 ring-white/5 shadow-md"
          >
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[#00FF41] tracking-tighter">
                {log.category} MISSION
              </span>
              <span className="text-[10px] text-zinc-500 uppercase mt-0.5">
                {format(new Date(log.logged_at), 'MMM dd, HH:mm')}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <span className="font-mono text-lg font-bold text-white">
                  {log.duration_minutes}
                </span>
                <span className="text-[8px] text-zinc-600 uppercase">Min</span>
              </div>

              <div className="flex flex-col items-center min-w-[40px]">
                <span className={`font-mono text-lg font-bold ${intensityColor}`}>
                  {log.intensity}
                </span>
                <span className="text-[8px] text-zinc-600 uppercase">Load</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
