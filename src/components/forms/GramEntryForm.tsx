'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'
import { calculateFoodLogNutrition } from '@/lib/metabolism/nutrition'
import { InputMode, MealType, BaseUnit } from '@prisma/client'

interface GramEntryFormProps {
  foodItem: {
    id: string
    name: string
    baseAmount: number
    baseUnit: BaseUnit
    gramsPerUnit: number | null
    servingSize: number | null
    servingUnit: string | null
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    caloriesPer100g: number
  }
  onSuccess?: () => void
}

export default function GramEntryForm({ foodItem, onSuccess }: GramEntryFormProps) {
  const [inputValue, setInputValue] = useState('')
  
  // Choose default mode: UNITS if available, then SERVING, then GRAMS
  const defaultMode: InputMode = foodItem.gramsPerUnit ? 'UNITS' : (foodItem.servingSize ? 'SERVING' : 'GRAMS')
  const [inputMode, setInputMode] = useState<InputMode>(defaultMode)
  
  const [mealType, setMealType] = useState<MealType>('LUNCH')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const isOnline = useOnlineStatus()
  const setPreview = useCockpitStore((state) => state.setPreview)

  const numericValue = parseFloat(inputValue) || 0
  
  const calculated = useMemo(() => {
    try {
      if (numericValue > 0) {
        return calculateFoodLogNutrition(foodItem, inputMode, numericValue)
      }
    } catch (e) {}
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
      calculatedGrams: calculated.calculatedGrams,
      calculatedProtein: calculated.calculatedProtein,
      calculatedCarbs: calculated.calculatedCarbs,
      calculatedFat: calculated.calculatedFat,
      calculatedCalories: calculated.calculatedCalories,
      mealType,
      notes: notes.trim() === '' ? undefined : notes
    }, isOnline)
    
    if (result?.error) {
      setStatusMessage({ type: 'error', text: result.error })
      setIsSubmitting(false)
    } else {
      setPreview(null)
      setStatusMessage({ type: 'success', text: 'Loggført operasjon.' })
      setTimeout(() => onSuccess?.(), 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Logging: {foodItem.name}
        </h2>
        
        <div className="flex justify-center gap-2 flex-wrap" role="radiogroup">
           <button 
            type="button"
            onClick={() => setInputMode('GRAMS')}
            className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${inputMode === 'GRAMS' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800'}`}
           >
             GRAM
           </button>
           {foodItem.gramsPerUnit && (
             <button 
              type="button"
              onClick={() => setInputMode('UNITS')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${inputMode === 'UNITS' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800'}`}
             >
               ANTALL ({foodItem.gramsPerUnit}g)
             </button>
           )}
           {foodItem.servingSize && (
             <button 
              type="button"
              onClick={() => setInputMode('SERVING')}
              className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold border transition-all ${inputMode === 'SERVING' ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'text-zinc-600 border-zinc-800'}`}
             >
               {foodItem.servingUnit?.toUpperCase() || 'PORSJON'} ({foodItem.servingSize}g)
             </button>
           )}
        </div>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          step="any"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="block w-full border-0 bg-transparent py-10 text-center font-mono text-7xl font-bold text-[#00FF41] placeholder-zinc-900 focus:ring-0 sm:text-8xl"
          placeholder="0"
          required
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] font-bold text-zinc-600 uppercase">
            {inputMode === 'GRAMS' ? 'Grams' : (inputMode === 'UNITS' ? 'Stk' : foodItem.servingUnit || 'Porsjon')}
          </span>
          {inputMode !== 'GRAMS' && calculated.calculatedGrams > 0 && (
            <span className="font-mono text-[9px] text-zinc-500 italic">
              ≈ {Math.round(calculated.calculatedGrams)}g totalt
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Måltid</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-lg bg-zinc-900 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          >
            <option value="BREAKFAST">Frokost</option>
            <option value="LUNCH">Lunsj</option>
            <option value="DINNER">Middag</option>
            <option value="SNACK">Snack</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Notater</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="..."
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 border-y border-white/5 py-6">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedProtein}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">Protein</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedCarbs}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">Karbs</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">{calculated.calculatedFat}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">Fett</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-[#00FF41]">{calculated.calculatedCalories}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">Kalorier</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || numericValue <= 0}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-xl font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30"
      >
        {isSubmitting ? 'OVERFØRER...' : 'LOGGFØR'}
      </button>

      {statusMessage && (
        <p className={`text-center font-mono text-xs uppercase ${statusMessage.type === 'error' ? 'text-red-500' : 'text-[#00FF41]'}`}>
          {statusMessage.text}
        </p>
      )}
    </form>
  )
}
