'use client'

import { useState, useMemo } from 'react'
import { TrainingCategory, Exercise } from '@prisma/client'
import { useI18n } from '@/hooks/useI18n'
import { refreshExerciseImage, batchGenerateImages } from '@/app/(dashboard)/training/exerciseActions'

interface ExerciseLibraryContentProps {
  exercises: Exercise[]
  pbs: Record<string, { weight: number, date: Date }>
}

export default function ExerciseLibraryContent({ exercises: initialExercises, pbs }: ExerciseLibraryContentProps) {
  const { t } = useI18n()
  const [exercises, setExercises] = useState(initialExercises)
  const [activeCategory, setCategory] = useState<TrainingCategory | 'ALL'>('PUSH')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isBatching, setIsBatching] = useState(false)
  const [batchError, setBatchError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const matchCat = activeCategory === 'ALL' || ex.category === activeCategory
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [exercises, activeCategory, search])

  const missingCount = exercises.filter(ex => !ex.image_url).length

  async function handleRefresh(id: string) {
    setUpdatingId(id)
    try {
      const res = await refreshExerciseImage(id)
      if (res.success && res.imageUrl) {
        setExercises(prev => prev.map(ex => 
          ex.id === id ? { ...ex, image_url: res.imageUrl } : ex
        ))
      } else {
        alert(res.error || 'Kunne ikke generere bilde. Sjekk API-nøkkel.')
      }
    } catch (e) {
      alert('Kritisk systemfeil ved bildeoppdatering.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleBatchInit() {
    setIsBatching(true)
    setBatchError(null)
    try {
      const res = await batchGenerateImages()
      if (res.success && res.updatedExercises) {
        const updates = res.updatedExercises
        if (updates.length === 0) {
          setBatchError('Ingen bilder ble generert. Sjekk at OPENAI_API_KEY er korrekt konfigurert i .env.')
        }
        setExercises(prev => prev.map(ex => {
          const update = updates.find((u: any) => u.id === ex.id)
          return update ? { ...ex, image_url: update.imageUrl } : ex
        }))
      } else {
        setBatchError(res.error || 'Batch-prosess feilet. Sjekk systemloggene.')
      }
    } catch (e) {
      setBatchError('Kritisk systemfeil under bildegenerering.')
    } finally {
      setIsBatching(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Batch Initialization Row */}
      {missingCount > 0 && (
         <div className="rounded-3xl bg-[#3B82F6]/5 p-6 ring-1 ring-[#3B82F6]/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-[#3B82F6]/10">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                  </div>
                  <div>
                     <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Visual_Payload_Missing</h3>
                     <p className="font-mono text-[9px] text-zinc-500 uppercase">{missingCount} øvelser mangler AI-illustrasjoner</p>
                  </div>
               </div>
               {batchError && (
                  <p className="font-mono text-[8px] text-red-500 uppercase ml-14">⚠️ ERROR: {batchError}</p>
               )}
            </div>
            <button 
              disabled={isBatching}
              onClick={handleBatchInit}
              className={`font-mono text-[10px] font-black px-6 py-3 rounded-xl transition-all shadow-lg ${isBatching ? 'bg-zinc-800 text-zinc-600 animate-pulse' : 'bg-[#3B82F6] text-white hover:scale-105 active:scale-95'}`}
            >
              {isBatching ? 'GENERATING_BATCH...' : `INITIALIZE_VISUALS (5)`}
            </button>
         </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 p-1 bg-white/5 rounded-full ring-1 ring-white/10">
           {(['PUSH', 'PULL', 'LEGS', 'ALL'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-mono text-[9px] font-bold transition-all ${activeCategory === cat ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {cat}
              </button>
           ))}
        </div>
        
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('training.search_placeholder')}
          className="w-full sm:w-64 rounded-xl bg-white/5 border-0 p-3 text-xs font-mono text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#3B82F6] outline-none"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(ex => (
          <div key={ex.id} className="group relative rounded-2xl bg-[#141416] ring-1 ring-white/10 overflow-hidden hover:ring-[#3B82F6]/50 transition-all shadow-xl">
             <div className="aspect-square relative overflow-hidden bg-zinc-900">
                {ex.image_url ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={ex.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-zinc-800">DATA_MISSING</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                {/* PB Badge */}
                {pbs[ex.id] && (
                   <div className="absolute top-4 right-4 bg-[#00FF41]/20 backdrop-blur-md border border-[#00FF41]/30 px-3 py-1.5 rounded-lg">
                      <p className="font-mono text-[8px] text-[#00FF41] uppercase leading-none mb-0.5">PB_WEIGHT</p>
                      <p className="font-mono text-sm font-bold text-white leading-none">{pbs[ex.id].weight}kg</p>
                   </div>
                )}

                <button 
                  disabled={updatingId === ex.id}
                  onClick={() => handleRefresh(ex.id)}
                  className={`absolute bottom-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-[#00FF41] transition-all ${updatingId === ex.id ? 'animate-spin text-[#00FF41]' : ''}`}
                  title={t('training.refresh_image')}
                >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
             </div>

             <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                   <div>
                      <h3 className="font-bold text-base text-white tracking-tight leading-tight">{ex.name.toUpperCase()}</h3>
                      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Class: {ex.category}</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <p className="text-[10px] text-zinc-400 font-mono leading-relaxed line-clamp-2">
                     {ex.instructions || 'System telemetry currently lacking instruction set for this movement.'}
                   </p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
         <div className="py-20 text-center rounded-3xl border-2 border-dashed border-white/5">
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">{t('training.no_results')}</p>
         </div>
      )}
    </div>
  )
}
