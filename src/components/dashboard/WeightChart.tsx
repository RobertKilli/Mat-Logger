'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'

interface WeightChartProps {
  data: { weight: number; logged_at: Date }[]
}

export default function WeightChart({ data }: WeightChartProps) {
  const chartHeight = 200
  const chartWidth = 500

  const points = useMemo(() => {
    if (data.length < 2) return ''
    
    const weights = data.map(d => d.weight)
    const minWeight = Math.min(...weights) - 2
    const maxWeight = Math.max(...weights) + 2
    const range = maxWeight - minWeight

    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = chartHeight - ((d.weight - minWeight) / range) * chartHeight
      return `${x},${y}`
    }).join(' ')
  }, [data])

  if (data.length < 2) {
    return (
      <div className="h-[200px] flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-white/5">
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest text-center px-8 text-balance">
          Trenger minst 2 loggføringer for å generere progresjonsanalyse
        </p>
      </div>
    )
  }

  const latestWeight = data[data.length - 1].weight
  const firstWeight = data[0].weight
  const diff = latestWeight - firstWeight

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between px-1">
         <div>
            <p className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Vekt_Trend (30 Dager)</p>
            <p className="font-mono text-3xl font-bold text-white tracking-tighter">
              {latestWeight}
              <span className="text-sm font-normal text-zinc-600 ml-1">kg</span>
            </p>
         </div>
         <div className="text-right">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Endring</p>
            <p className={`font-mono text-lg font-bold ${diff > 0 ? 'text-[#00FF41]' : diff < 0 ? 'text-blue-400' : 'text-zinc-500'}`}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
            </p>
         </div>
      </div>

      <div className="relative rounded-2xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-inner overflow-hidden">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />

          {/* Area under line */}
          <polyline
            fill="url(#gradient)"
            points={`${chartWidth},${chartHeight} 0,${chartHeight} ${points}`}
            style={{ opacity: 0.1 }}
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#00FF41"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,65,0.3))' }}
          />

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00FF41', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00FF41', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between px-1">
         <span className="font-mono text-[8px] text-zinc-600 uppercase">{format(data[0].logged_at, 'd. MMM')}</span>
         <span className="font-mono text-[8px] text-zinc-600 uppercase">{format(data[data.length - 1].logged_at, 'd. MMM')}</span>
      </div>
    </div>
  )
}
