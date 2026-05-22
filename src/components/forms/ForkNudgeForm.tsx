'use client'

import { useState } from 'react'
import { forkFoodItem } from '@/app/(dashboard)/library/actions'
import { FoodCategory, BaseUnit } from '@prisma/client'

interface ForkNudgeFormProps {
  item: {
    id: string
    name: string
    brand?: string | null
    category: FoodCategory
    image_url?: string | null
    baseAmount: number
    baseUnit: BaseUnit
    gramsPerUnit?: number | null
    servingSize?: number | null
    servingUnit?: string | null
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    caloriesPer100g: number
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ForkNudgeForm({ item, onSuccess, onCancel }: ForkNudgeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(item.name)
  const [brand, setBrand] = useState(item.brand || '')
  const [gramsPerUnit, setGramsPerUnit] = useState(item.gramsPerUnit?.toString() || '')
  const [servingSize, setServingSize] = useState(item.servingSize?.toString() || '')
  const [servingUnit, setServingUnit] = useState(item.servingUnit || 'porsjon')
  const [protein, setProtein] = useState(item.proteinPer100g.toString())
  const [carbs, setCarbs] = useState(item.carbsPer100g.toString())
  const [fat, setFat] = useState(item.fatPer100g.toString())
  const [calories, setCalories] = useState(item.caloriesPer100g.toString())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await forkFoodItem(item.id, {
      name,
      brand: brand || undefined,
      category: item.category,
      image_url: item.image_url || undefined,
      baseAmount: item.baseAmount,
      baseUnit: item.baseUnit,
      gramsPerUnit: gramsPerUnit ? parseFloat(gramsPerUnit) : undefined,
      servingSize: servingSize ? parseFloat(servingSize) : undefined,
      servingUnit: servingUnit || undefined,
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      calories: parseInt(calories),
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-[10px] font-mono uppercase text-zinc-500">Produktnavn</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Stykkvekt (g)</label>
          <input value={gramsPerUnit} onChange={(e) => setGramsPerUnit(e.target.value)} type="number" step="0.1" className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]" placeholder="f.eks. 55" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Porsjon (g)</label>
          <input value={servingSize} onChange={(e) => setServingSize(e.target.value)} type="number" step="0.1" className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10" />
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
        <p className="text-[10px] font-mono text-center text-zinc-500 uppercase tracking-widest">Justering per {item.baseAmount}g</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">P</label>
            <input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">C</label>
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">F</label>
            <input value={fat} onChange={(e) => setFat(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Kcal</label>
            <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-[#00FF41] font-bold" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl bg-zinc-900 py-4 font-bold text-zinc-400">AVBRYT</button>
        <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-[#00FF41] py-4 font-bold text-black">{loading ? 'LAGRER...' : 'BEKREFT'}</button>
      </div>
    </form>
  )
}
