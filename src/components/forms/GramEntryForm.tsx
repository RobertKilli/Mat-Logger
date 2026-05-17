'use client'

import { useState, useRef, useEffect } from 'react'
import { calculateScaledMacros } from '@/lib/metabolism/macros'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'

interface GramEntryFormProps {
  foodItem: {
    id: string
    name: string
    protein_100g: number
    carbs_100g: number
    fat_100g: number
    calories_100g: number
  }
  onSuccess?: () => void
}

export default function GramEntryForm({ foodItem, onSuccess }: GramEntryFormProps) {
  const [grams, setGrams] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isOnline = useOnlineStatus()
  const { proteinGoal, dailyConsumedProtein, setPreview } = useCockpitStore()

  const numericGrams = parseFloat(grams) || 0
  const scaled = calculateScaledMacros(numericGrams, {
    protein: foodItem.protein_100g,
    carbs: foodItem.carbs_100g,
    fat: foodItem.fat_100g,
    calories: foodItem.calories_100g,
  })

  // Update store preview as-you-go
  useEffect(() => {
    if (numericGrams > 0) {
      setPreview({
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        calories: scaled.calories
      })
    } else {
      setPreview(null)
    }
  }, [numericGrams, scaled, setPreview])

  // Clear preview on unmount
  useEffect(() => {
    return () => setPreview(null)
  }, [setPreview])

  const proteinImpactPercent = proteinGoal > 0 
    ? (scaled.protein / proteinGoal) * 100 
    : 0
  
  const currentProteinPercent = proteinGoal > 0
    ? (dailyConsumedProtein / proteinGoal) * 100
    : 0

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (numericGrams <= 0) return

    setIsSubmitting(true)
    const result = await executeLogAction('FOOD', {
      foodItemId: foodItem.id,
      weightGrams: numericGrams,
      ...scaled
    }, isOnline)
    
    if (result?.error) {
      alert(result.error)
      setIsSubmitting(false)
    } else {
      setPreview(null)
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          Logging: {foodItem.name}
        </h2>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="block w-full border-0 bg-transparent py-10 text-center font-mono text-7xl font-bold text-[#00FF41] placeholder-zinc-800 focus:ring-0 sm:text-8xl"
            placeholder="0"
            required
          />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-sm font-bold text-zinc-600 uppercase">
            Grams
          </span>
        </div>
      </div>

      {/* Goal Impact Visualization */}
      {proteinGoal > 0 && (
        <div className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <span>Protein Goal Impact</span>
            <span className="text-[#00FF41]">+{proteinImpactPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div 
              className="flex h-full transition-all duration-300 ease-out"
            >
              <div 
                className="bg-zinc-700 h-full" 
                style={{ width: `${Math.min(currentProteinPercent, 100)}%` }}
              />
              <div 
                className="bg-[#00FF41] h-full animate-pulse" 
                style={{ width: `${Math.min(proteinImpactPercent, 100 - currentProteinPercent)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-zinc-500">
            <span>{dailyConsumedProtein}g</span>
            <span>Target: {proteinGoal}g</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 border-y border-white/5 py-6">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{scaled.protein.toFixed(1)}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Protein</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{scaled.carbs.toFixed(1)}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Carbs</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{scaled.fat.toFixed(1)}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Fat</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-[#00FF41]">{scaled.calories}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Calories</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || numericGrams <= 0}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-xl font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30 disabled:grayscale"
      >
        {isSubmitting ? 'TRANSMITTING...' : 'LOG ENTRY'}
      </button>
    </form>
  )
}
