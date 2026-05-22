'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { calculateScaledMacros } from '@/lib/metabolism/macros'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'

interface GramEntryFormProps {
  foodItem: {
    id: string
    name: string
    unit_weight?: number | null
    protein_100g: number
    carbs_100g: number
    fat_100g: number
    calories_100g: number
  }
  onSuccess?: () => void
}

export default function GramEntryForm({ foodItem, onSuccess }: GramEntryFormProps) {
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<'GRAMS' | 'QUANTITY'>(foodItem.unit_weight ? 'QUANTITY' : 'GRAMS')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isOnline = useOnlineStatus()
  
  const proteinGoal = useCockpitStore((state) => state.proteinGoal)
  const dailyConsumedProtein = useCockpitStore((state) => state.dailyConsumedProtein)
  const setPreview = useCockpitStore((state) => state.setPreview)

  const numericValue = parseFloat(inputValue) || 0
  
  const effectiveGrams = useMemo(() => {
    if (mode === 'QUANTITY' && foodItem.unit_weight) {
      return numericValue * foodItem.unit_weight
    }
    return numericValue
  }, [mode, numericValue, foodItem.unit_weight])

  const scaled = useMemo(() => calculateScaledMacros(effectiveGrams, {
    protein: foodItem.protein_100g,
    carbs: foodItem.carbs_100g,
    fat: foodItem.fat_100g,
    calories: foodItem.calories_100g,
  }), [effectiveGrams, foodItem])

  useEffect(() => {
    if (effectiveGrams > 0) {
      setPreview({
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        calories: scaled.calories
      })
    } else {
      setPreview(null)
    }
  }, [effectiveGrams, scaled, setPreview])

  useEffect(() => {
    return () => setPreview(null)
  }, [setPreview])

  const proteinImpactPercent = proteinGoal > 0 
    ? (scaled.protein / proteinGoal) * 100 
    : 0
  
  const currentProteinPercent = proteinGoal > 0
    ? (dailyConsumedProtein / proteinGoal) * 100
    : 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (effectiveGrams <= 0) return

    setIsSubmitting(true)
    setStatusMessage(null)

    const result = await executeLogAction('FOOD', {
      foodItemId: foodItem.id,
      weightGrams: effectiveGrams,
      ...scaled
    }, isOnline)
    
    if (result?.error) {
      setStatusMessage({ type: 'error', text: result.error })
      setIsSubmitting(false)
    } else {
      setPreview(null)
      setStatusMessage({ type: 'success', text: 'Transmission complete. Logged.' })
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          Logging: {foodItem.name}
        </h2>
        {foodItem.unit_weight && (
          <div className="flex justify-center gap-2">
             <button 
              type="button"
              onClick={() => setMode('GRAMS')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${mode === 'GRAMS' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800'}`}
             >
               GRAMS
             </button>
             <button 
              type="button"
              onClick={() => setMode('QUANTITY')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${mode === 'QUANTITY' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800'}`}
             >
               QUANTITY
             </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <label htmlFor="log-input" className="sr-only">
            {mode === 'GRAMS' ? 'Weight in grams' : 'Number of units'}
          </label>
          <input
            id="log-input"
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="block w-full border-0 bg-transparent py-10 text-center font-mono text-7xl font-bold text-[#00FF41] placeholder-zinc-800 focus:ring-0 sm:text-8xl focus-visible:ring-2 focus-visible:ring-[#00FF41]/20 rounded-xl"
            placeholder="0"
            required
            aria-invalid={statusMessage?.type === 'error'}
            aria-describedby={statusMessage ? "form-status" : undefined}
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" aria-hidden="true">
            <span className="font-mono text-sm font-bold text-zinc-600 uppercase">
              {mode === 'GRAMS' ? 'Grams' : 'Units'}
            </span>
            {mode === 'QUANTITY' && effectiveGrams > 0 && (
              <span className="font-mono text-[10px] text-zinc-500 italic">
                ≈ {Math.round(effectiveGrams)}g total
              </span>
            )}
          </div>
        </div>
      </div>

      {proteinGoal > 0 && (
        <div 
          className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10"
          role="progressbar"
          aria-label="Protein Goal Impact"
          aria-valuenow={Math.round(currentProteinPercent + proteinImpactPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <span>Protein Goal Impact</span>
            <span className="text-[#00FF41]" aria-live="polite">+{proteinImpactPercent.toFixed(1)}%</span>
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

      <div className="grid grid-cols-4 gap-2 border-y border-white/5 py-6" aria-label="Scaled Nutrients">
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

      <div id="form-status" aria-live="assertive" className="text-center min-h-[1.5rem]">
        {statusMessage && (
          <p className={`font-mono text-xs uppercase font-bold ${statusMessage.type === 'error' ? 'text-red-500' : 'text-[#00FF41]'}`}>
            {statusMessage.text}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || effectiveGrams <= 0}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-xl font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30 disabled:grayscale focus-visible:ring-4 focus-visible:ring-[#00FF41]/40 outline-none"
      >
        {isSubmitting ? 'TRANSMITTING...' : 'LOG ENTRY'}
      </button>
    </form>
  )
}
