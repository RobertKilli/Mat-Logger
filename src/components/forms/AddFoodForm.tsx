'use client'

import { useState } from 'react'
import { addFoodItem, lookupExternalFood } from '@/app/(dashboard)/library/actions'
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
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<FoodCategory>('OTHER')
  const [image_url, setImageUrl] = useState('')
  const [baseAmount, setBaseAmount] = useState('100')
  const [baseUnit, setBaseUnit] = useState<BaseUnit>('GRAM')
  const [gramsPerUnit, setGramsPerUnit] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [calories, setCalories] = useState('')

  async function handleSmartLookup() {
    if (!name || name.length < 2) {
      setError('Skriv inn et produktnavn for å søke')
      return
    }

    setLookupLoading(true)
    setError(null)

    try {
      const result = await lookupExternalFood(name)
      if (result.data && result.data.length > 0) {
        const item = result.data[0] // Take the best match
        setBrand(item.brand || '')
        setCategory(item.category)
        setImageUrl(item.image_url || '')
        setProtein(item.protein.toString())
        setCarbs(item.carbs.toString())
        setFat(item.fat.toString())
        setCalories(item.calories.toString())
        if (item.unit_weight) setGramsPerUnit(item.unit_weight.toString())
        
        setError(`Fant data for "${item.name}" på nett!`)
        setTimeout(() => setError(null), 3000)
      } else {
        setError('Fant ingen matvarer på nett med det navnet')
      }
    } catch (e) {
      setError('Kunne ikke koble til søketjenesten')
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = {
      name,
      brand: brand || undefined,
      category,
      image_url: image_url || undefined,
      baseAmount: parseFloat(baseAmount),
      baseUnit,
      gramsPerUnit: gramsPerUnit ? parseFloat(gramsPerUnit) : undefined,
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      calories: parseInt(calories),
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
      <div className="space-y-1">
        <label className="block text-[10px] font-mono uppercase text-zinc-500">Produktnavn</label>
        <div className="flex gap-2">
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            className="flex-1 rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. Kyllingfilet"
          />
          <button
            type="button"
            onClick={handleSmartLookup}
            disabled={lookupLoading || name.length < 2}
            className="rounded-lg bg-[#00FF41]/10 px-3 font-mono text-[9px] font-bold text-[#00FF41] ring-1 ring-[#00FF41]/20 hover:bg-[#00FF41]/20 disabled:opacity-30"
          >
            {lookupLoading ? 'SØKER...' : 'HENT FRA NETT'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Merke (valgfritt)</label>
          <input 
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. Prior"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Kategori</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            className="w-full rounded-lg bg-zinc-900 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500">Basis Mengde</label>
          <div className="flex gap-2">
            <input 
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              required 
              className="w-2/3 rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10"
            />
            <select 
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
            value={gramsPerUnit}
            onChange={(e) => setGramsPerUnit(e.target.value)}
            type="number"
            step="0.1"
            className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
            placeholder="f.eks. 60 for egg"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-mono uppercase text-zinc-500">Bilde URL</label>
        <input 
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full rounded-lg bg-white/5 border-0 p-3 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41]"
          placeholder="https://..."
        />
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
        <p className="text-[10px] font-mono text-center text-zinc-500 uppercase tracking-widest">
          Næring per {baseAmount || '100'}{baseUnit === 'GRAM' ? 'g' : baseUnit === 'ML' ? 'ml' : 'stk'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Protein</label>
            <input value={protein} onChange={(e) => setProtein(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Karbs</label>
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Fett</label>
            <input value={fat} onChange={(e) => setFat(e.target.value)} type="number" step="0.1" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-white ring-1 ring-white/10" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 text-center">Kcal</label>
            <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" required className="w-full rounded bg-zinc-900 border-0 p-2 text-center text-[#00FF41] ring-1 ring-white/10 font-bold" placeholder="0" />
          </div>
        </div>
      </div>

      {error && <p className={`text-xs font-mono text-center ${error.includes('Fant data') ? 'text-[#00FF41]' : 'text-red-500'}`}>{error}</p>}

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
          disabled={loading}
          className="flex-1 rounded-xl bg-[#00FF41] py-4 font-bold text-black hover:bg-[#00FF41]/90"
        >
          {loading ? 'LAGRER...' : 'LAGRE MATVARE'}
        </button>
      </div>
    </form>
  )
}
