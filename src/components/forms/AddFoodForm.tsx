'use client'

import { useState } from 'react'
import { addFoodItem } from '@/app/(dashboard)/library/actions'
import { FoodCategory } from '@prisma/client'

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as FoodCategory,
      image_url: formData.get('image_url') as string || undefined,
      unit_weight: formData.get('unit_weight') ? parseFloat(formData.get('unit_weight') as string) : undefined,
      protein_100g: parseFloat(formData.get('protein') as string),
      carbs_100g: parseFloat(formData.get('carbs') as string),
      fat_100g: parseFloat(formData.get('fat') as string),
      calories_100g: parseInt(formData.get('calories') as string),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase text-zinc-500">Produktnavn</label>
        <input 
          name="name" 
          required 
          className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          placeholder="f.eks. Kyllingfilet"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase text-zinc-500">Kategori</label>
          <select 
            name="category" 
            className="w-full rounded-lg bg-zinc-900 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase text-zinc-500">Stykkvekt (gram per stk)</label>
          <input 
            name="unit_weight" 
            type="number"
            step="0.1"
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. 60 for egg"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Protein</label>
          <input name="protein" type="number" step="0.1" required className="w-full rounded bg-white/5 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Karbs</label>
          <input name="carbs" type="number" step="0.1" required className="w-full rounded bg-white/5 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Fett</label>
          <input name="fat" type="number" step="0.1" required className="w-full rounded bg-white/5 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Kcal</label>
          <input name="calories" type="number" required className="w-full rounded bg-white/5 border-0 p-2 text-center text-[#00FF41] ring-1 ring-white/10 font-bold" placeholder="0" />
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
          {loading ? 'LAGRER...' : 'LEGG TIL'}
        </button>
      </div>
    </form>
  )
}
