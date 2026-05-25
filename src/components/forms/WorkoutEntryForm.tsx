'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'
import { useRouter } from 'next/navigation'
import { getExercisesByCategory } from '@/app/(dashboard)/training/actions'
import { TrainingCategory } from '@prisma/client'

interface SelectedExercise {
  id: string
  exerciseId: string
  name: string
  sets: number
  reps: number
  weight: string
}

export default function WorkoutEntryForm() {
  const [category, setCategory] = useState<TrainingCategory | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [duration, setDuration] = useState('45')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  // Exercise Library State
  const [libraryExercises, setLibraryExercises] = useState<{id: string, name: string}[]>([])
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)

  const isOnline = useOnlineStatus()
  const setPreview = useCockpitStore((state) => state.setPreview)
  const router = useRouter()

  // Fetch library when category changes
  useEffect(() => {
    if (category) {
      getExercisesByCategory(category).then(res => {
        if (res.data) setLibraryExercises(res.data)
      })
    } else {
      setLibraryExercises([])
    }
    // Clear selection if category changes? Maybe not, but for now yes.
    setSelectedExercises([])
  }, [category])

  // Update store preview
  useEffect(() => {
    setPreview({ intensity })
  }, [intensity, setPreview])

  useEffect(() => {
    return () => setPreview(null)
  }, [setPreview])

  const filteredLibrary = useMemo(() => {
    return libraryExercises.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedExercises.some(se => se.exerciseId === ex.id)
    )
  }, [libraryExercises, searchQuery, selectedExercises])

  function addExercise(ex: {id: string, name: string}) {
    setSelectedExercises([...selectedExercises, {
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: ex.id,
      name: ex.name,
      sets: 3,
      reps: 10,
      weight: ''
    }])
    setShowLibrary(false)
    setSearchQuery('')
  }

  function removeExercise(id: string) {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== id))
  }

  function updateExercise(id: string, field: keyof SelectedExercise, value: any) {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !duration) return
    
    setIsSubmitting(true)
    setStatusMessage(null)

    // Using the same TRAINING type but with extended payload
    // Our syncService/executeLogAction needs to be able to pass this through
    const result = await executeLogAction('TRAINING', {
      category,
      duration: parseInt(duration),
      intensity,
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight ? parseFloat(ex.weight) : undefined
      }))
    }, isOnline)

    if (result?.error) {
      setStatusMessage({ type: 'error', text: result.error })
      setIsSubmitting(false)
    } else {
      setPreview(null)
      setStatusMessage({ type: 'success', text: 'Operational data recorded.' })
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Category Selection */}
      <div className="space-y-4">
        <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-[0.2em] text-center block">
          MISSION_PROTOCOL
        </span>
        <div className="grid grid-cols-3 gap-3">
          {(['PUSH', 'PULL', 'LEGS'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xl py-6 font-mono text-xs font-bold transition-all ring-1 outline-none ${
                category === cat
                  ? 'bg-[#00FF41] text-black ring-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                  : 'bg-white/5 text-zinc-500 ring-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Builder */}
      {category && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">Økt_Innhold</h3>
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="font-mono text-[9px] font-bold text-[#00FF41] uppercase hover:underline"
            >
              + Legg til øvelse
            </button>
          </div>

          <div className="space-y-4">
            {selectedExercises.map((ex) => (
              <div key={ex.id} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{ex.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeExercise(ex.id)}
                    className="text-zinc-600 hover:text-red-500"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Sett</label>
                    <input 
                      type="number"
                      value={ex.sets}
                      onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value))}
                      className="w-full rounded bg-zinc-900 border-0 p-2 text-xs font-mono text-white ring-1 ring-white/5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Reps</label>
                    <input 
                      type="number"
                      value={ex.reps}
                      onChange={(e) => updateExercise(ex.id, 'reps', parseInt(e.target.value))}
                      className="w-full rounded bg-zinc-900 border-0 p-2 text-xs font-mono text-white ring-1 ring-white/5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono text-zinc-500 uppercase">Vekt (kg)</label>
                    <input 
                      type="number"
                      step="0.5"
                      value={ex.weight}
                      onChange={(e) => updateExercise(ex.id, 'weight', e.target.value)}
                      placeholder="-"
                      className="w-full rounded bg-zinc-900 border-0 p-2 text-xs font-mono text-white ring-1 ring-white/5"
                    />
                  </div>
                </div>
              </div>
            ))}

            {selectedExercises.length === 0 && (
               <div className="py-8 text-center border border-dashed border-zinc-800 rounded-xl">
                  <p className="font-mono text-[9px] text-zinc-600 uppercase">Ingen øvelser valgt</p>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Library Modal/Overlay */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">Øvelses_Bibliotek</h3>
              <button onClick={() => setShowLibrary(false)} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <input 
              autoFocus
              type="text"
              placeholder="SØK_ØVELSE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border-0 p-4 text-sm font-mono text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredLibrary.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addExercise(ex)}
                  className="w-full text-left rounded-lg p-3 hover:bg-[#00FF41]/10 group transition-all"
                >
                  <span className="font-mono text-xs text-zinc-400 group-hover:text-[#00FF41]">{ex.name}</span>
                </button>
              ))}
              {filteredLibrary.length === 0 && (
                <p className="text-center py-4 font-mono text-[10px] text-zinc-600">Ingen treff</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Metrics */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest">Intensity</label>
            <span className="font-mono text-2xl font-bold text-[#00FF41]">{intensity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF41] outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest block">Duration</label>
          <div className="relative">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-xl font-bold text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[8px] text-zinc-600 uppercase">Min</span>
          </div>
        </div>
      </div>

      <div className="text-center min-h-[1.5rem]">
        {statusMessage && (
          <p className={`font-mono text-xs uppercase font-bold ${statusMessage.type === 'error' ? 'text-red-500' : 'text-[#00FF41]'}`}>
            {statusMessage.text}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !category || !duration}
        className="w-full rounded-xl bg-[#00FF41] py-5 text-lg font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-30 disabled:grayscale shadow-lg"
      >
        {isSubmitting ? 'INITIATING_TRANSFER...' : 'CONFIRM_MISSION_DATA'}
      </button>
    </form>
  )
}
