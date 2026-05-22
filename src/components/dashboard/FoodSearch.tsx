'use client'

import { useState, useEffect } from 'react'
import { searchFoodItems, forkFoodItem, deleteFoodItem } from '@/app/(dashboard)/library/actions'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react'
import ForkNudgeForm from '@/components/forms/ForkNudgeForm'
import AddFoodForm from '@/components/forms/AddFoodForm'

interface FoodItem {
  id: string
  name: string
  category: string
  image_url?: string | null
  unit_weight?: number | null
  protein_100g: number
  carbs_100g: number
  fat_100g: number
  calories_100g: number
  user_id?: string | null
  brand?: string
  source?: 'OFF'
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
          const result = await searchFoodItems(query, { preferNorwegian, includeExternal: true })
          if (result.error) {
            setSearchError(result.error)
            setResults({ internal: [], external: [] })
          } else if (result.data) {
            setResults(result.data as any)
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
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, preferNorwegian])

  async function handleAddToLibrary(item: FoodItem) {
    const result = await forkFoodItem(item.id, {
      name: item.name,
      category: item.category as any,
      image_url: item.image_url || undefined,
      unit_weight: item.unit_weight || undefined,
      protein: item.protein_100g,
      carbs: item.carbs_100g,
      fat: item.fat_100g,
      calories: item.calories_100g
    })

    if (result.data) {
       setQuery('')
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Er du sikker på at du vil slette denne matvaren permanent fra ditt bibliotek?')) {
      const result = await deleteFoodItem(id)
      if (result.success) {
        setQuery('') // Trigger refresh
      } else {
        alert(result.error)
      }
    }
  }

  const hasResults = results.internal.length > 0 || results.external.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor="food-search" className="sr-only">Søk i matbibliotek</label>
          <input
            id="food-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SØK I MATBIBLIOTEK..."
            className="w-full rounded-xl border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-sm tracking-widest text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41] outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00FF41] border-t-transparent" />
            ) : (
              <span className="font-mono text-xs text-zinc-600">CMD+K</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="rounded-xl bg-white/5 px-6 py-4 font-mono text-xs font-bold text-[#00FF41] ring-1 ring-white/10 hover:bg-white/10 transition-all"
        >
          + NY MATVARE
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={preferNorwegian}
          onChange={setPreferNorwegian}
          className={`${
            preferNorwegian ? 'bg-[#00FF41]' : 'bg-zinc-800'
          } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
        >
          <span className="sr-only">Foretrekk norske kilder</span>
          <span
            aria-hidden="true"
            className={`${preferNorwegian ? 'translate-x-4' : 'translate-x-0'}
              pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
        <span className="font-mono text-[10px] uppercase text-zinc-500">Foretrekk norske kilder (OFF)</span>
      </div>

      <div className="space-y-6" aria-live="polite">
        {searchError && (
          <div className="py-10 text-center font-mono text-xs text-red-500 uppercase">
            ⚠️ {searchError}
          </div>
        )}

        {/* Internal Results */}
        {results.internal.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest ml-1">Lagret i ditt cockpit</h4>
            {results.internal.map((item) => (
              <FoodItemRow 
                key={item.id} 
                item={item} 
                onFork={() => setForkItem(item)} 
                onDelete={item.user_id ? () => handleDelete(item.id) : undefined}
                isInternal 
              />
            ))}
          </div>
        )}

        {/* External Results */}
        {results.external.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest ml-1">Funnet på nett (Open Food Facts)</h4>
            {results.external.map((item) => (
              <FoodItemRow 
                key={item.id} 
                item={item} 
                onAdd={() => handleAddToLibrary(item)}
                onFork={() => setForkItem(item)}
              />
            ))}
          </div>
        )}

        {query.length >= 2 && !hasResults && !isLoading && !searchError && (
          <div className="py-10 text-center font-mono text-xs text-zinc-600 uppercase">
            Ingen treff i databasen eller på nett
          </div>
        )}
      </div>

      {/* Fork/Nudge Modal */}
      <Dialog open={!!forkItem} onClose={() => setForkItem(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-[#141416] p-8 ring-1 ring-white/10 shadow-2xl">
            <DialogTitle className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-tight mb-6">
              Fork & Nudge
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

      {/* Add New Modal */}
      <Dialog open={isAddingNew} onClose={() => setIsAddingNew(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-[#141416] p-8 ring-1 ring-white/10 shadow-2xl">
            <DialogTitle className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-tight mb-6">
              Legg til ny matvare
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

function FoodItemRow({ 
  item, 
  onFork, 
  onAdd, 
  onDelete,
  isInternal 
}: { 
  item: FoodItem, 
  onFork: () => void, 
  onAdd?: () => void, 
  onDelete?: () => void,
  isInternal?: boolean 
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl bg-[#141416] p-3 ring-1 ring-white/5 transition-all hover:bg-white/5 hover:ring-[#00FF41]/30 focus-within:ring-2 focus-within:ring-[#00FF41]">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-[8px] text-zinc-700">NO IMG</div>
        )}
      </div>
      
      <Link href={`/quick-log?item=${item.id}`} className="flex-1 outline-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white group-hover:text-[#00FF41] leading-tight">
              {item.name.toUpperCase()}
            </h3>
            {item.user_id && isInternal && (
              <span className="rounded bg-[#00FF41]/10 px-1.5 py-0.5 font-mono text-[8px] text-[#00FF41]">PERSONAL</span>
            )}
          </div>
          {item.brand && <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.brand}</span>}
          <div className="mt-1 flex gap-3 font-mono text-[9px] text-zinc-500 uppercase tracking-tighter">
            <span>P: {item.protein_100g}</span>
            <span>C: {item.carbs_100g}</span>
            <span>F: {item.fat_100g}</span>
            <span className="text-zinc-400">{item.calories_100g} kcal</span>
          </div>
          {item.unit_weight && (
            <span className="text-[8px] font-mono text-[#00FF41]/60 uppercase mt-0.5">Stykkvekt: {item.unit_weight}g</span>
          )}
        </div>
      </Link>

      <div className="flex gap-2">
        {onAdd && (
          <button
            onClick={onAdd}
            aria-label="Legg til i bibliotek"
            className="rounded-lg bg-[#00FF41]/10 px-3 py-2 font-mono text-[9px] font-bold text-[#00FF41] hover:bg-[#00FF41] hover:text-black transition-colors outline-none focus:ring-1 focus:ring-[#00FF41]"
          >
            SAVE
          </button>
        )}
        <button
          onClick={onFork}
          aria-label="Fork og endre"
          className="rounded-lg bg-zinc-900 px-3 py-2 font-mono text-[9px] font-bold text-zinc-500 hover:bg-zinc-800 transition-colors outline-none focus:ring-1 focus:ring-[#00FF41]"
        >
          FORK
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label="Slett matvare"
            className="rounded-lg bg-red-500/10 px-3 py-2 font-mono text-[9px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors outline-none focus:ring-1 focus:ring-red-500"
          >
            DEL
          </button>
        )}
      </div>
    </div>
  )
}
