'use client'

import { useState } from 'react'
import { recordSubjectiveFeedback } from '@/app/(dashboard)/training/actions'
import { useCockpitStore } from '@/store/cockpitStore'

interface FeedbackLoopProps {
  workoutId: string
  onSuccess?: () => void
}

export default function FeedbackLoop({ workoutId, onSuccess }: FeedbackLoopProps) {
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const cnsFatigue = useCockpitStore((state) => state.cnsFatigue)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await recordSubjectiveFeedback(workoutId, {
      rating,
      notes,
      predictedFatigue: cnsFatigue,
    })

    if (result.success) {
      setIsDone(true)
      setTimeout(() => onSuccess?.(), 2000)
    } else {
      alert(result.error)
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <div className="rounded-2xl bg-[#00FF41]/10 p-8 text-center ring-1 ring-[#00FF41]/20 animate-pulse">
        <p className="font-mono text-xs font-bold text-[#00FF41] uppercase tracking-widest">
          Calibration Synchronized
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-tight">
            Subjective Readiness Loop
          </h3>
          <p className="text-xs text-zinc-500">How did you actually feel during the mission?</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <label className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">
              Readiness Score
            </label>
            <span className="font-mono text-3xl font-bold text-[#00FF41]">{rating}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41]"
          />
          <div className="flex justify-between font-mono text-[8px] text-zinc-700 uppercase">
            <span>Totally Drained</span>
            <span>Peak Performance</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">
            Operational Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Discrepancies from prediction..."
            className="w-full rounded-xl border-0 bg-white/5 py-4 px-4 font-sans text-sm text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#00FF41] h-24 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-white/5 py-4 font-mono text-xs font-bold text-[#00FF41] ring-1 ring-[#00FF41]/30 hover:bg-[#00FF41]/10 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'CALIBRATING...' : 'EXECUTE CALIBRATION'}
        </button>
      </form>
    </div>
  )
}
