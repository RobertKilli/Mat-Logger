'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import { calculateCNSFatigue } from '@/lib/metabolism/recovery'

export default function CNSMeter() {
  const { cnsFatigue, cnsRecoveryHours, preview, recentWorkoutLogs } = useCockpitStore()

  // Calculate projected state
  let projectedPercentage = cnsFatigue
  let projectedRecoveryHours = cnsRecoveryHours

  if (preview && preview.intensity !== null) {
    const projectedLogs = [
      ...recentWorkoutLogs,
      { intensity: preview.intensity, logged_at: new Date() }
    ]
    const projection = calculateCNSFatigue(projectedLogs)
    projectedPercentage = projection.percentage
    projectedRecoveryHours = projection.recoveryTimeHours
  }

  // SVG Circle parameters
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const baseOffset = circumference - (cnsFatigue / 100) * circumference
  const projectedOffset = circumference - (projectedPercentage / 100) * circumference

  // Color logic
  let color = '#00FF41' // Green
  let statusText = 'OPTIMAL'
  
  if (projectedPercentage > 70) {
    color = '#EF4444' // Red
    statusText = 'OVERLOAD'
  } else if (projectedPercentage > 30) {
    color = '#F59E0B' // Orange
    statusText = 'ACCUMULATED'
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-[#141416] aspect-square ring-1 ring-white/10 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">
        CNS Fatigue
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
          {preview && projectedPercentage !== cnsFatigue && (
            <span className="text-[8px] font-mono text-red-500 mt-1">
              +{projectedPercentage - cnsFatigue}% LOAD
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          <span className="text-[8px] font-mono text-zinc-600 uppercase">
            {statusText}
          </span>
        </div>
        {(projectedRecoveryHours > 0 || cnsRecoveryHours > 0) && (
          <span className={`text-[7px] font-mono uppercase ${preview ? 'text-red-500' : 'text-[#00FF41]/60'}`}>
            Recov. in {projectedRecoveryHours}h
          </span>
        )}
      </div>
    </div>
  )
}
