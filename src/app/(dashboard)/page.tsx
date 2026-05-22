'use client'

import DailySummary from '@/components/dashboard/DailySummary'
import GlycogenClock from '@/components/dashboard/GlycogenClock'
import CNSMeter from '@/components/dashboard/CNSMeter'
import FeedbackLoop from '@/components/forms/FeedbackLoop'
import Link from 'next/link'
import { useCockpitStore } from '@/store/cockpitStore'
import { format } from 'date-fns'
import { deleteFoodLog } from './quick-log/actions'
import { useState } from 'react'

export default function DashboardPage() {
  const { dailyFoodLogs, recentWorkoutLogs } = useCockpitStore()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  async function handleDeleteLog(id: string) {
    setIsDeleting(id)
    const result = await deleteFoodLog(id)
    if (result.success) {
      // Local update via refresh or store (server action triggers revalidate)
    }
    setIsDeleting(null)
  }

  // Find the most recent workout that hasn't been rated yet (subjective fatigue is null)
  // Note: We'd need to extend workoutLog in store to track feedback status
  const pendingFeedback = null // Placeholder for now

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6 sm:p-12">
      <section className="grid gap-8 md:grid-cols-2">
        {/* Main indicators */}
        <div className="space-y-4">
           <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Klarhets-indikatorer</h2>
           <div className="grid grid-cols-2 gap-4">
              <GlycogenClock />
              <CNSMeter />
           </div>
        </div>

        <div className="space-y-4">
           <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Ernæringsstatus</h2>
           <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg">
              <DailySummary />
           </div>
        </div>
      </section>

      {/* Operation Log */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Dagens operasjoner</h2>
        <div className="rounded-2xl bg-[#141416] overflow-hidden ring-1 ring-white/10 shadow-lg">
          {dailyFoodLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center mb-3">
                 <div className="h-1 w-1 rounded-full bg-zinc-700" />
              </div>
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-tighter">
                Ingen aktive operasjoner registrert i cockpit
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {dailyFoodLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-200">{log.name.toUpperCase()}</span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">
                      {format(new Date(log.time), 'HH:mm')} • {log.weight}G
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#00FF41]">+{log.calories} KCAL</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteLog(log.id)}
                      disabled={isDeleting === log.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-red-500 disabled:opacity-50"
                      aria-label="Slett loggføring"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
         <Link 
          href="/library" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#00FF41]">ÅPNE BIBLIOTEK</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Søk & Logg drivstoff</p>
         </Link>
         <Link 
          href="/training" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#3B82F6]">LOGG ØKT</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Push / Pull / Legs</p>
         </Link>
         <Link 
          href="/history" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#F59E0B]">OPPERASJONSLOGG</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Se historiske data</p>
         </Link>
         <Link 
          href="/profile" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-white">PILOT PROFIL</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Konfigurer baseline</p>
         </Link>
      </section>
    </main>
  )
}
