'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'
import { calculateNutrition } from '@/lib/metabolism/nutrition'
import { InputMode, MealType, BaseUnit } from '@prisma/client'

interface GramEntryFormProps {
  foodItem: {
    id: string
    name: string
    baseAmount: number
    baseUnit: BaseUnit
    gramsPerUnit: number | null
    protein: number
    carbs: number
    fat: number
    calories: number
  }
  onSuccess?: () => void
}

export default function GramEntryForm({ foodItem, onSuccess }: GramEntryFormProps) {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>(foodItem.gramsPerUnit ? 'UNITS' : 'GRAMS')
  const [mealType, setMealType] = useState<MealType>('LUNCH')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const isOnline = useOnlineStatus()
  
  const proteinGoal = useCockpitStore((state) => state.proteinGoal)
  const dailyConsumedProtein = useCockpitStore((state) => state.dailyConsumedProtein)
  const setPreview = useCockpitStore((state) => state.setPreview)

  const numericValue = parseFloat(inputValue) || 0
  
  const calculated = useMemo(() => {
    try {
      if (numericValue > 0) {
        return calculateNutrition(foodItem, inputMode, numericValue)
      }
    } catch (e) {
      // Catch validation errors during input
    }
    return {
      calculatedGrams: 0,
      calculatedProtein: 0,
      calculatedCarbs: 0,
      calculatedFat: 0,
      calculatedCalories: 0
    }
  }, [numericValue, inputMode, foodItem])

  useEffect(() => {
    if (numericValue > 0) {
      setPreview({
        protein: calculated.calculatedProtein,
        carbs: calculated.calculatedCarbs,
        fat: calculated.calculatedFat,
        calories: calculated.calculatedCalories
      })
    } else {
      setPreview(null)
    }
  }, [numericValue, calculated, setPreview])

  useEffect(() => {
    return () => setPreview(null)
  }, [setPreview])

  const proteinImpactPercent = proteinGoal > 0 
    ? (calculated.calculatedProtein / proteinGoal) * 100 
    : 0
  
  const currentProteinPercent = proteinGoal > 0
    ? (dailyConsumedProtein / proteinGoal) * 100
    : 0

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (numericValue <= 0) return

    setIsSubmitting(true)
    setStatusMessage(null)

    const result = await executeLogAction('FOOD', {
      foodItem,
      inputMode,
      inputAmount: numericValue,
      mealType,
      notes: notes.trim() === '' ? undefined : notes
    }, isOnline)
    
    if (result?.error) {
      setStatusMessage({ type: 'error', text: result.error })
      setIsSubmitting(false)
    } else {
      setPreview(null)
      setStatusMessage({ type: 'success', text: 'Transmisjon fullført. Logget.' })
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          Logger: {foodItem.name}
        </h2>
        {foodItem.gramsPerUnit && (
          <div className="flex justify-center gap-2" role="radiogroup" aria-label="Input Mode">
             <button 
              type="button"
              role="radio"
              aria-checked={inputMode === 'GRAMS'}
              onClick={() => setInputMode('GRAMS')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${inputMode === 'GRAMS' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800 focus-visible:ring-2 focus-visible:ring-[#00FF41] outline-none'}`}
             >
               GRAMS
             </button>
             <button 
              type="button"
              role="radio"
              aria-checked={inputMode === 'UNITS'}
              onClick={() => setInputMode('UNITS')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${inputMode === 'UNITS' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800 focus-visible:ring-2 focus-visible:ring-[#00FF41] outline-none'}`}
             >
               ANTALL
             </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <label htmlFor="log-input" className="sr-only">
            {inputMode === 'GRAMS' ? 'Vekt i gram' : 'Antall enheter'}
          </label>
          <input
            id="log-input"
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step={inputMode === 'GRAMS' ? '1' : '0.1'}
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
              {inputMode === 'GRAMS' ? 'Grams' : 'Stk'}
            </span>
            {inputMode === 'UNITS' && calculated.calculatedGrams > 0 && (
              <span className="font-mono text-[10px] text-zinc-500 italic">
                ≈ {Math.round(calculated.calculatedGrams)}g totalt
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="meal-type" className="block text-[10px] font-mono uppercase text-zinc-500">Måltid</label>
          <select
            id="meal-type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-lg bg-zinc-900 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none"
          >
            <option value="BREAKFAST">Frokost</option>
            <option value="LUNCH">Lunsj</option>
            <option value="DINNER">Middag</option>
            <option value="SNACK">Snack</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-[10px] font-mono uppercase text-zinc-500">Notater (valgfritt)</label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="F.eks. etter trening"
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none"
          />
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
            <span>Proteinmål Effekt</span>
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
            <span>Mål: {proteinGoal}g</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 border-y border-white/5 py-6" aria-label="Utregnet næring">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedProtein}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Protein</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedCarbs}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Karbs</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedFat}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Fett</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-[#00FF41]">{calculated.calculatedCalories}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Kalorier</p>
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
        disabled={isSubmitting || numericValue <= 0}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-xl font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30 disabled:grayscale focus-visible:ring-4 focus-visible:ring-[#00FF41]/40 outline-none"
      >
        {isSubmitting ? 'TRANSMITTERER...' : 'BEKREFT LOGG'}
      </button>
    </form>
  )
}
