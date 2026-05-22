'use client'

import { useState, useEffect } from 'react'
import { getLatestBiometrics } from '@/app/(dashboard)/profile/garminActions'

interface BiometricCardProps {
  label: string
  value: string | number
  unit: string
  status?: 'OPTIMAL' | 'STRESSED' | 'CRITICAL'
}

const TYPE_MAP: Record<string, { label: string, unit: string }> = {
  RESTING_HR: { label: 'RESTING_HR', unit: 'BPM' },
  SLEEP_SCORE: { label: 'SLEEP_SCORE', unit: '/100' },
  STRESS_LEVEL: { label: 'STRESS_LEVEL', unit: 'LVL' },
  BODY_BATTERY: { label: 'BODY_BATTERY', unit: '%' },
}

export default function BiometricTelemetry() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBiometrics() {
      const res = await getLatestBiometrics()
      if (res.data) {
        setData(res.data)
      }
      setLoading(false)
    }
    fetchBiometrics()
  }, [])

  // Default values if no data exists
  const displayData = [
    { type: 'RESTING_HR', value: 60, unit: 'BPM', status: 'OPTIMAL' },
    { type: 'SLEEP_SCORE', value: 75, unit: '/100', status: 'OPTIMAL' },
    { type: 'STRESS_LEVEL', value: 30, unit: 'LVL', status: 'OPTIMAL' },
    { type: 'BODY_BATTERY', value: 50, unit: '%', status: 'OPTIMAL' },
  ]

  // Merge real data into display list
  const finalDisplay = displayData.map(def => {
    const real = data.find(d => d.type === def.type)
    if (real) {
      return {
        ...def,
        value: real.value,
        status: (def.type === 'STRESS_LEVEL' && real.value > 60) ? 'STRESSED' : 'OPTIMAL'
      }
    }
    return def
  })

  if (loading) return <div className="h-32 animate-pulse bg-white/5 rounded-2xl" />

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between px-1">
         <h2 className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Biometrisk Telemetri (Garmin)</h2>
         <span className="font-mono text-[8px] text-[#00FF41] animate-pulse">● LIVE_FEED</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {finalDisplay.map((bio) => (
          <div key={bio.type} className="rounded-xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-lg relative overflow-hidden group hover:ring-[#00FF41]/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent group-hover:via-[#00FF41]/50" />
            
            <p className="font-mono text-[8px] text-zinc-600 uppercase mb-2 tracking-tighter">{bio.type}</p>
            <div className="flex items-baseline gap-1">
               <span className="font-mono text-xl font-bold text-white tracking-tighter">{bio.value}</span>
               <span className="font-mono text-[8px] text-zinc-500 uppercase">{bio.unit}</span>
            </div>
            
            <div className="mt-3 flex items-center gap-1.5">
               <div className={`h-1 w-1 rounded-full ${bio.status === 'OPTIMAL' ? 'bg-[#00FF41]' : 'bg-red-500'}`} />
               <span className="font-mono text-[7px] text-zinc-700 uppercase tracking-widest">Status: {bio.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
