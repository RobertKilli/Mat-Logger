'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { executeLogAction } from '@/lib/metabolism/syncService'
import { useRouter } from 'next/navigation'
import { getExercisesByCategory, saveWorkoutAsTemplate } from '@/app/(dashboard)/training/actions'
import { refreshExerciseImage } from '@/app/(dashboard)/training/exerciseActions'
import { TrainingCategory } from '@prisma/client'
import { useI18n } from '@/hooks/useI18n'

interface SelectedExercise {
  id: string
  exerciseId: string
  name: string
  sets: number
  reps: number
  weight: string
}

interface WorkoutEntryFormProps {
  templates?: any[]
}

export default function WorkoutEntryForm({ templates = [] }: WorkoutEntryFormProps) {
  const { t } = useI18n()
  const [category, setCategory] = useState<TrainingCategory | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [duration, setDuration] = useState('45')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  // Exercise Library State
  const [libraryExercises, setLibraryExercises] = useState<{id: string, name: string, image_url?: string | null}[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)

  // Template State
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const isOnline = useOnlineStatus()
  const setPreview = useCockpitStore((state) => state.setPreview)
  const router = useRouter()

  // Fetch library when category changes
  useEffect(() => {
    if (category) {
      setIsLoadingLibrary(true)
      getExercisesByCategory(category).then(res => {
        if (res.data) {
          setLibraryExercises(res.data)
        } else if (res.error) {
          setStatusMessage({ type: 'error', text: res.error })
        }
        setIsLoadingLibrary(false)
      }).catch(() => {
        setStatusMessage({ type: 'error', text: 'Nettverksfeil ved henting av bibliotek' })
        setIsLoadingLibrary(false)
      })
    } else {
      setLibraryExercises([])
    }
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

  function applyTemplate(template: any) {
    setCategory(template.category)
    setSelectedExercises(template.template_exercises.map((te: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      exerciseId: te.exercise_id,
      name: te.exercise.name,
      sets: te.sets,
      reps: te.reps,
      weight: te.weight?.toString() || ''
    })))
  }

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

  async function handleRefreshImage(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const res = await refreshExerciseImage(id)
    if (res.success && res.imageUrl) {
      setLibraryExercises(prev => prev.map(ex => 
        ex.id === id ? { ...ex, image_url: res.imageUrl } : ex
      ))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !duration) return
    
    setIsSubmitting(true)
    setStatusMessage(null)

    // 1. Log the actual workout
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
      return
    }

    // 2. Optional: Save as template
    if (saveAsTemplate && templateName.trim()) {
      await saveWorkoutAsTemplate(templateName, category, selectedExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight ? parseFloat(ex.weight) : undefined
      })))
    }

    setPreview(null)
    setStatusMessage({ type: 'success', text: 'Operational data recorded.' })
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  return (
    <div className="space-y-12">
      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="space-y-4">
          <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-[0.2em] block">
            {t('training.saved_routines')}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {templates.map(t_item => (
              <button
                key={t_item.id}
                type="button"
                onClick={() => applyTemplate(t_item)}
                className="shrink-0 rounded-full px-4 py-2 bg-white/5 border border-white/10 font-mono text-[9px] font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
              >
                {t_item.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

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
                onClick={() => {
                  setCategory(cat)
                  if (!selectedExercises.length) setSelectedExercises([])
                }}
                className={`rounded-xl py-6 font-mono text-xs font-bold transition-all ring-1 outline-none ${
                  category === cat
                    ? 'bg-[#00FF41] text-black ring-[#00FF41] shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                    : 'bg-white/5 text-zinc-500 ring-white/10 hover:bg-white/10'
                }`}
              >
                {t(`training.${cat.toLowerCase()}` as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Builder */}
        {category && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">{t('training.session_content')}</h3>
              <button
                type="button"
                disabled={isLoadingLibrary}
                onClick={() => setShowLibrary(true)}
                className="font-mono text-[9px] font-bold text-[#00FF41] uppercase hover:underline disabled:opacity-30"
              >
                {isLoadingLibrary ? t('common.loading') : `+ ${t('training.add_exercise')}`}
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
                    <p className="font-mono text-[9px] text-zinc-600 uppercase">{t('training.no_exercises')}</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Save as Template */}
        {selectedExercises.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#00FF41]/5 border border-[#00FF41]/10 space-y-4">
             <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-[#00FF41] focus:ring-[#00FF41]"
                />
                <span className="font-mono text-[10px] font-bold text-[#00FF41] uppercase tracking-widest">{t('training.save_as_routine')}</span>
             </label>
             
             {saveAsTemplate && (
                <input 
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={t('training.routine_placeholder')}
                  className="w-full rounded-xl bg-black/40 border-0 p-3 text-xs font-mono text-white ring-1 ring-[#00FF41]/20 focus:ring-2 focus:ring-[#00FF41] outline-none"
                />
             )}
          </div>
        )}

        {/* Global Metrics */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest">{t('training.intensity')}</label>
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
            <label className="font-mono text-[9px] uppercase text-zinc-500 tracking-widest block">{t('training.duration')}</label>
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
          {isSubmitting ? t('training.transferring') : t('training.confirm_mission')}
        </button>
      </form>

      {/* Library Modal/Overlay */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">{t('training.exercise_library')} ({libraryExercises.length})</h3>
              <button onClick={() => setShowLibrary(false)} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <input 
              autoFocus
              type="text"
              placeholder={t('training.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border-0 p-4 text-sm font-mono text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none"
            />

            <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredLibrary.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addExercise(ex)}
                  className="w-full text-left rounded-xl p-2 hover:bg-[#00FF41]/10 group transition-all flex items-center gap-3 border border-transparent hover:border-[#00FF41]/20"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
                    {ex.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ex.image_url} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-[6px] text-zinc-800">NO_IMG</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-zinc-300 group-hover:text-white truncate">{ex.name.toUpperCase()}</p>
                    <p className="font-mono text-[7px] text-zinc-600 uppercase">Mission: {category}</p>
                  </div>
                  <button
                    onClick={(e) => handleRefreshImage(e, ex.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-[#00FF41] transition-colors"
                    title={t('training.refresh_image')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                  </button>
                </button>
              ))}
              {filteredLibrary.length === 0 && (
                <p className="text-center py-4 font-mono text-[10px] text-zinc-600">{t('training.no_results')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
