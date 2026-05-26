import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getWeightHistory } from './actions'
import WeightChart from '@/components/dashboard/WeightChart'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: weightHistory } = await getWeightHistory(30)

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              PROGRESS_CENTER
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Analyses & Performance Trends</p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Weight Analysis */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Kroppssammensetning</h2>
            <div className="rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10">
              <WeightChart data={weightHistory} />
            </div>
          </section>

          {/* Quick Stats */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Nøkkeltall</h2>
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                 <p className="font-mono text-[9px] text-zinc-500 uppercase">Gjennomsnittlig Vekt</p>
                 <p className="font-mono text-xl font-bold text-white mt-1">
                   {weightHistory.length > 0 
                     ? (weightHistory.reduce((s, b) => s + b.weight, 0) / weightHistory.length).toFixed(1) 
                     : 'N/A'
                   } kg
                 </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                 <p className="font-mono text-[9px] text-zinc-500 uppercase">Loggføringer (30d)</p>
                 <p className="font-mono text-xl font-bold text-[#00FF41] mt-1">{weightHistory.length} Sessions</p>
              </div>
            </div>
          </section>
        </div>

        {/* Future placeholders for Strength trends */}
        <section className="space-y-4 opacity-30 grayscale cursor-not-allowed">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Styrkeutvikling (1RM Trender)</h2>
            <span className="font-mono text-[8px] bg-white/10 px-2 py-1 rounded text-white">UPCOMING_MODULE</span>
          </div>
          <div className="h-48 rounded-3xl border border-dashed border-zinc-800 flex items-center justify-center">
             <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">Kalkulerer biomekanisk progresjon...</p>
          </div>
        </section>
      </div>
    </div>
  )
}
