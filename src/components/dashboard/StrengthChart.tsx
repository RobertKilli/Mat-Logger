'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'

interface StrengthChartProps {
  exerciseName: string
  data: { date: Date, oneRM: number }[]
}

export default function StrengthChart({ exerciseName, data }: StrengthChartProps) {
  const chartHeight = 120
  const chartWidth = 400

  const points = useMemo(() => {
    if (data.length < 2) return ''
    
    const oneRMs = data.map(d => d.oneRM)
    const minRM = Math.min(...oneRMs) * 0.95
    const maxRM = Math.max(...oneRMs) * 1.05
    const range = maxRM - minRM

    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = chartHeight - ((d.oneRM - minRM) / range) * chartHeight
      return `${x},${y}`
    }).join(' ')
  }, [data])

  if (data.length < 2) return null

  const latestRM = data[data.length - 1].oneRM
  const firstRM = data[0].oneRM
  const diff = latestRM - firstRM

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/[0.07] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Est. 1RM Trend</p>
          <h3 className="font-bold text-sm text-white">{exerciseName.toUpperCase()}</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-[#3B82F6]">{latestRM}kg</p>
          <p className={`font-mono text-[8px] uppercase ${diff > 0 ? 'text-[#00FF41]' : 'text-zinc-500'}`}>
            {diff > 0 ? `+${diff.toFixed(1)}kg` : 'Stabil'}
          </p>
        </div>
      </div>

      <div className="relative h-24 w-full">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ opacity: 0.8 }}
          />
          {/* Dots on points */}
          {data.map((d, i) => {
             const coords = points.split(' ')[i].split(',')
             return (
                <circle 
                  key={i} 
                  cx={coords[0]} 
                  cy={coords[1]} 
                  r="3" 
                  fill="#3B82F6" 
                />
             )
          })}
        </svg>
      </div>
      
      <div className="mt-2 flex justify-between">
         <span className="font-mono text-[7px] text-zinc-600 uppercase">{format(data[0].date, 'd. MMM')}</span>
         <span className="font-mono text-[7px] text-zinc-600 uppercase">{format(data[data.length - 1].date, 'd. MMM')}</span>
      </div>
    </div>
  )
}
