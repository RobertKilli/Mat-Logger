'use client'

import { useState, useEffect } from 'react'
import { lookupExternalFood, forkFoodItem, deleteFoodItem } from '@/app/(dashboard)/library/actions'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react'
import ForkNudgeForm from '@/components/forms/ForkNudgeForm'
import AddFoodForm from '@/components/forms/AddFoodForm'

interface FoodItem {
  id: string
  name: string
  brand?: string | null
  category: string
  image_url?: string | null
  gramsPerUnit?: number | null
  servingSize?: number | null
  servingUnit?: string | null
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  caloriesPer100g: number
  user_id?: string | null
  barcode?: string | null
  source?: string
}

export default function FoodSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ internal: FoodItem[], external: FoodItem[] }>({ internal: [], external: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [preferNorwegian, setPreferNorwegian] = useState(true)
  const [forkItem, setForkItem] = useState<FoodItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    setSearchError(null)
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          // Fetch from our local search action (which searches both DB and OFF)
          const result = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`).then(res => res.json())
          
          if (result.error) {
            setSearchError(result.error)
          } else {
            // Filter internal from a combined result if the API did that, 
            // but for now let's assume we have internal and external results.
            // Actually, I'll update searchFoodItems action later to be more robust.
            // For now, let's just show the external results.
            setResults({ internal: [], external: result.data || [] })
          }
        } catch (e) {
          setSearchError('Klarte ikke å koble til søketjenesten')
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults({ internal: [], external: [] })
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  async function handleAddToLibrary(item: FoodItem) {
    try {
      const result = await fetch('/api/foods/import', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())

      if (result.data) {
         setQuery('')
         alert(`Lagret "${item.name}" i biblioteket ditt!`)
      }
    } catch (e) {
      alert('Kunne ikke lagre matvaren')
    }
  }

  const hasResults = results.internal.length > 0 || results.external.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SØK ETTER MATVARER (f.eks. First Price Egg)..."
            className="w-full rounded-xl border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-sm tracking-widest text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41] outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00FF41] border-t-transparent" />}
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="rounded-xl bg-white/5 px-6 py-4 font-mono text-xs font-bold text-[#00FF41] ring-1 ring-white/10 hover:bg-white/10 transition-all"
        >
          + MANUELL REGISTRERING
        </button>
      </div>

      {searchError && (
        <div className="py-10 text-center font-mono text-xs text-red-500 uppercase">
          ⚠️ {searchError}
        </div>
      )}

      <div className="space-y-2">
        {results.external.map((item) => (
          <FoodItemRow 
            key={item.id} 
            item={item} 
            onAdd={() => handleAddToLibrary(item)}
            onFork={() => setForkItem(item)}
          />
        ))}

        {query.length >= 2 && !hasResults && !isLoading && !searchError && (
          <div className="py-10 text-center font-mono text-xs text-zinc-600 uppercase">
            Ingen treff i databasen eller på nett
          </div>
        )}
      </div>

      <Dialog open={!!forkItem} onClose={() => setForkItem(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-[#141416] p-8 ring-1 ring-white/10 shadow-2xl">
            <DialogTitle className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-tight mb-6">
              Korriger & Lagre
            </DialogTitle>
            {forkItem && (
              <ForkNudgeForm 
                item={forkItem as any} 
                onSuccess={() => {
                  setForkItem(null)
                  setQuery('')
                }} 
                onCancel={() => setForkItem(null)}
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={isAddingNew} onClose={() => setIsAddingNew(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-[#141416] p-8 ring-1 ring-white/10 shadow-2xl">
            <DialogTitle className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-tight mb-6">
              Ny matvare
            </DialogTitle>
            <AddFoodForm 
              onSuccess={() => {
                setIsAddingNew(false)
                setQuery('')
              }}
              onCancel={() => setIsAddingNew(false)}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

function FoodItemRow({ item, onFork, onAdd }: { item: FoodItem, onFork: () => void, onAdd?: () => void }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl bg-[#141416] p-3 ring-1 ring-white/5 transition-all hover:bg-white/5 hover:ring-[#00FF41]/30">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-[8px] text-zinc-700 uppercase">No Img</div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white group-hover:text-[#00FF41] leading-tight truncate">
          {item.name.toUpperCase()}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[9px] text-zinc-500 uppercase tracking-tighter">
          <span>P: {item.proteinPer100g}</span>
          <span>C: {item.carbsPer100g}</span>
          <span>F: {item.fatPer100g}</span>
          <span className="text-zinc-400">{item.caloriesPer100g} kcal</span>
          {item.brand && <span className="text-[#00FF41]/40">BRAND: {item.brand}</span>}
        </div>
        {(item.gramsPerUnit || item.servingSize) && (
          <div className="mt-1 flex gap-2 font-mono text-[8px] text-[#00FF41]/60 uppercase">
             {item.gramsPerUnit && <span>Stykk: {item.gramsPerUnit}g</span>}
             {item.servingSize && <span>Porsjon: {item.servingSize}g ({item.servingUnit})</span>}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAdd}
          className="rounded-lg bg-[#00FF41]/10 px-3 py-2 font-mono text-[9px] font-bold text-[#00FF41] hover:bg-[#00FF41] hover:text-black transition-colors"
        >
          SAVE
        </button>
        <button
          onClick={onFork}
          className="rounded-lg bg-zinc-900 px-3 py-2 font-mono text-[9px] font-bold text-zinc-500 hover:bg-zinc-800 transition-colors"
        >
          EDIT
        </button>
      </div>
    </div>
  )
}
