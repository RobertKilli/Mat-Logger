'use client'

import { useState } from 'react'
import { forkFoodItem } from '@/app/(dashboard)/library/actions'
import { FoodCategory } from '@prisma/client'

interface ForkNudgeFormProps {
  item: {
    id: string
    name: string
    category: string
    unit_weight?: number | null
    image_url?: string | null
    protein_100g: number
    carbs_100g: number
    fat_100g: number
    calories_100g: number
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ForkNudgeForm({ item, onSuccess, onCancel }: ForkNudgeFormProps) {
  const [name, setName] = useState(`${item.name} (Kopi)`)
  const [protein, setProtein] = useState(item.protein_100g)
  const [carbs, setCarbs] = useState(item.carbs_100g)
  const [fat, setFat] = useState(item.fat_100g)
  const [calories, setCalories] = useState(item.calories_100g)
  const [unitWeight, setUnitWeight] = useState(item.unit_weight?.toString() ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nudge = (setter: (val: number) => void, current: number, delta: number) => {
    setter(Math.max(0, Number((current + delta).toFixed(1))))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await forkFoodItem(item.id, {
      name,
      category: item.category as FoodCategory,
      image_url: item.image_url || undefined,
      unit_weight: unitWeight ? parseFloat(unitWeight) : undefined,
      protein,
      carbs,
      fat,
      calories,
    })

    if (result.data) {
      onSuccess?.()
    } else {
      alert(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase text-zinc-500">Navn på variant</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border-0 bg-white/5 py-3 pl-4 font-bold text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase text-zinc-500">Stykkvekt (gram per stk)</label>
        <input
          type="number"
          step="0.1"
          value={unitWeight}
          onChange={(e) => setUnitWeight(e.target.value)}
          placeholder="Valgfritt (f.eks. 60 for egg)"
          className="w-full rounded-lg border-0 bg-white/5 py-3 pl-4 font-bold text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Protein', value: protein, setter: setProtein, step: 1 },
          { label: 'Karbs', value: carbs, setter: setCarbs, step: 1 },
          { label: 'Fett', value: fat, setter: setFat, step: 0.5 },
          { label: 'Kalorier', value: calories, setter: setCalories, step: 10 },
        ].map((macro) => (
          <div key={macro.label} className="space-y-2">
            <label className="font-mono text-[10px] uppercase text-zinc-500">{macro.label} / 100g</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nudge(macro.setter, macro.value, -macro.step)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 font-bold text-white hover:bg-white/10"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-xl font-bold text-white">
                {macro.value}
              </div>
              <button
                type="button"
                onClick={() => nudge(macro.setter, macro.value, macro.step)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 font-bold text-white hover:bg-white/10"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-zinc-900 py-4 font-bold text-zinc-400 hover:text-white"
        >
          AVBRYT
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-[#00FF41] py-4 font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-50"
        >
          {isSubmitting ? 'LAGRER...' : 'LAGRE VARIANT'}
        </button>
      </div>
    </form>
  )
}
