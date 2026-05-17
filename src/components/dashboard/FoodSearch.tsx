'use client'

import { useState, useEffect } from 'react'
import { searchFoodItems } from '@/app/(dashboard)/library/actions'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import ForkNudgeForm from '@/components/forms/ForkNudgeForm'

interface FoodItem {
  id: string
  name: string
  protein_100g: number
  carbs_100g: number
  fat_100g: number
  calories_100g: number
  user_id?: string | null
}

export default function FoodSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [forkItem, setForkItem] = useState<FoodItem | null>(null)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        const result = await searchFoodItems(query)
        if (result.data) {
          setResults(result.data as FoodItem[])
        }
        setIsLoading(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH FOOD LIBRARY..."
          className="w-full rounded-xl border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-sm tracking-widest text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00FF41] border-t-transparent" />
          ) : (
            <span className="font-mono text-xs text-zinc-600">CMD+K</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2 rounded-xl bg-[#141416] p-4 ring-1 ring-white/5 transition-all hover:bg-white/5 hover:ring-[#00FF41]/30"
          >
            <Link
              href={`/quick-log?item=${item.id}`}
              className="flex-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#00FF41]">
                    {item.name.toUpperCase()}
                    {item.user_id && (
                      <span className="ml-2 rounded bg-[#00FF41]/10 px-1.5 py-0.5 font-mono text-[8px] text-[#00FF41]">
                        PERSONAL
                      </span>
                    )}
                  </h3>
                  <div className="mt-1 flex gap-3 font-mono text-[10px] text-zinc-500 uppercase tracking-tighter">
                    <span>P: {item.protein_100g}</span>
                    <span>C: {item.carbs_100g}</span>
                    <span>F: {item.fat_100g}</span>
                    <span className="text-zinc-400">{item.calories_100g} kcal</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <button
              onClick={() => setForkItem(item)}
              className="rounded-lg bg-zinc-900 px-3 py-2 font-mono text-[10px] font-bold text-zinc-500 hover:bg-[#00FF41] hover:text-black transition-colors"
            >
              FORK
            </button>
          </div>
        ))}

        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="py-10 text-center font-mono text-xs text-zinc-600 uppercase">
            No matches found in database
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
                item={forkItem} 
                onSuccess={() => {
                  setForkItem(null)
                  setQuery('') // Reset search to see new item
                }} 
                onCancel={() => setForkItem(null)}
              />
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
