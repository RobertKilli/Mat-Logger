'use client'

import { useState } from 'react'
import { addFoodItem } from '@/app/(dashboard)/library/actions'
import { FoodCategory, BaseUnit } from '@prisma/client'

interface AddFoodFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'MEAT', label: 'Kjøtt' },
  { value: 'FISH', label: 'Fisk' },
  { value: 'FRUIT', label: 'Frukt' },
  { value: 'VEGETABLE', label: 'Grønnsak' },
  { value: 'DAIRY', label: 'Meieri' },
  { value: 'GRAIN', label: 'Korn/Brød' },
  { value: 'SUPPLEMENT', label: 'Kosttilskudd' },
  { value: 'OTHER', label: 'Annet' },
]

export default function AddFoodForm({ onSuccess, onCancel }: AddFoodFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [baseUnit, setBaseUnit] = useState<BaseUnit>('GRAM')
  const [baseAmount, setBaseAmount] = useState('100')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string || undefined,
      category: formData.get('category') as FoodCategory,
      image_url: formData.get('image_url') as string || undefined,
      baseAmount: parseFloat(baseAmount),
      baseUnit: baseUnit,
      gramsPerUnit: formData.get('gramsPerUnit') ? parseFloat(formData.get('gramsPerUnit') as string) : undefined,
      protein: parseFloat(formData.get('protein') as string),
      carbs: parseFloat(formData.get('carbs') as string),
      fat: parseFloat(formData.get('fat') as string),
      calories: parseInt(formData.get('calories') as string),
    }

    const result = await addFoodItem(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Produktnavn</label>
          <input 
            name="name" 
            required 
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. Kyllingfilet"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Merke (valgfritt)</label>
          <input 
            name="brand" 
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. Prior"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Basis Mengde</label>
          <div className="flex gap-2">
            <input 
              name="baseAmount" 
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              required 
              className="w-2/3 rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10"
            />
            <select 
              name="baseUnit" 
              value={baseUnit}
              onChange={(e) => setBaseUnit(e.target.value as BaseUnit)}
              className="w-1/3 rounded-lg bg-zinc-900 border-0 text-[10px] font-mono p-1 text-white ring-1 ring-white/10"
            >
              <option value="GRAM">G</option>
              <option value="ML">ML</option>
              <option value="UNIT">STK</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Stykkvekt (gram per stk)</label>
          <input 
            name="gramsPerUnit" 
            type="number"
            step="0.1"
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. 60 for egg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Kategori</label>
          <select 
            name="category" 
            className="w-full rounded-lg bg-zinc-900 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Bilde URL</label>
          <input 
            name="image_url" 
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
        <p className="text-[10px] font-mono text-center text-zinc-500 uppercase tracking-widest">
          Næring per {baseAmount || '100'}{baseUnit === 'GRAM' ? 'g' : baseUnit === 'ML' ? 'ml' : 'stk'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Protein</label>
            <input name="protein" type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Karbs</label>
            <input name="carbs" type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Fett</label>
            <input name="fat" type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Kcal</label>
            <input name="calories" type="number" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-[#00FF41] ring-1 ring-white/10 font-bold" placeholder="0" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-white/5 py-4 font-mono text-xs font-bold text-zinc-400 hover:bg-white/10"
        >
          AVBRYT
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-[#00FF41] py-4 font-mono text-xs font-bold text-black hover:bg-[#00FF41]/90"
        >
          {loading ? 'LAGRER...' : 'LAGRE MATVARE'}
        </button>
      </div>
    </form>
  )
}
