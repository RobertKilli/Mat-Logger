'use client'

import { useState, useEffect } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'
import { useRouter } from 'next/navigation'

export default function WorkoutEntryForm() {
  const [category, setCategory] = useState<'PUSH' | 'PULL' | 'LEGS' | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [duration, setDuration] = useState('45')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOnline = useOnlineStatus()
  const setPreview = useCockpitStore((state) => state.setPreview)
  const router = useRouter()

  // Update store preview as-you-go
  useEffect(() => {
    setPreview({ intensity })
  }, [intensity, setPreview])

  // Clear preview on unmount
  useEffect(() => {
    return () => setPreview(null)
  }, [setPreview])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !duration) return
    
    setIsSubmitting(true)
    const result = await executeLogAction('TRAINING', {
      category,
      duration: parseInt(duration),
      intensity
    }, isOnline)

    if (result?.error) {
      alert(result.error)
      setIsSubmitting(false)
    } else {
      setPreview(null)
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-4">
        <label className="font-mono text-xs uppercase text-zinc-500 tracking-widest text-center block">
          Select Mission Category
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['PUSH', 'PULL', 'LEGS'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xl py-6 font-mono text-xs font-bold transition-all ring-1 ${
                category === cat
                  ? 'bg-[#00FF41] text-black ring-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                  : 'bg-white/5 text-zinc-500 ring-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <label className="font-mono text-xs uppercase text-zinc-500 tracking-widest">
            Intensity Level
          </label>
          <span className="font-mono text-4xl font-bold text-[#00FF41]">{intensity}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41]"
        />
        <div className="flex justify-between font-mono text-[10px] text-zinc-600 uppercase">
          <span>Recovery</span>
          <span>Max Effort</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="font-mono text-xs uppercase text-zinc-500 tracking-widest block">
          Duration (Minutes)
        </label>
        <div className="relative">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-xl border-0 bg-white/5 py-5 pl-6 pr-16 font-mono text-3xl font-bold text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            required
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600 uppercase">
            Min
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !category || !duration}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-xl font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30 disabled:grayscale"
      >
        {isSubmitting ? 'RECORDING...' : 'CONFIRM MISSION'}
      </button>
    </form>
  )
}
