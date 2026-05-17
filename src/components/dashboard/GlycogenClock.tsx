'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import { calculateGlycogenState } from '@/lib/metabolism/glycogen'

export default function GlycogenClock() {
  const { weight, dailyConsumedCarbs, glycogenLevel, preview } = useCockpitStore()

  // SVG Circle parameters
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const baseOffset = circumference - (glycogenLevel / 100) * circumference

  // Calculate projected state
  let projectedPercentage = glycogenLevel
  if (preview && weight) {
    const now = new Date()
    const hoursToday = now.getHours() + now.getMinutes() / 60
    const projection = calculateGlycogenState(weight, dailyConsumedCarbs + preview.carbs, hoursToday)
    projectedPercentage = projection.percentage
  }
  const projectedOffset = circumference - (projectedPercentage / 100) * circumference

  // Color logic
  let color = '#00FF41' // Green
  if (projectedPercentage < 30) color = '#EF4444' // Red
  else if (projectedPercentage < 70) color = '#F59E0B' // Orange

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-[#141416] aspect-square ring-1 ring-white/10 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">
        Glycogen
      </span>

      <div className="relative flex items-center justify-center">
        <svg className="h-32 w-32 -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/5"
          />
          {/* Base circle (current) */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: baseOffset }}
            strokeLinecap="round"
          />
          {/* Projected circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: projectedOffset }}
            className={`transition-all duration-1000 ease-out ${preview ? 'animate-pulse' : ''}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
             <span className="text-4xl font-bold font-mono text-white tracking-tighter">
              {projectedPercentage}
            </span>
            <span className="text-sm font-mono text-zinc-600">%</span>
          </div>
          {preview && projectedPercentage !== glycogenLevel && (
            <span className="text-[8px] font-mono text-[#00FF41] mt-1">
              +{projectedPercentage - glycogenLevel}% EST.
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-[8px] font-mono text-zinc-600 uppercase">
          {projectedPercentage < 30 ? 'CRITICAL DEBT' : projectedPercentage < 70 ? 'DEPLETING' : 'OPTIMAL'}
        </span>
      </div>
    </div>
  )
}
