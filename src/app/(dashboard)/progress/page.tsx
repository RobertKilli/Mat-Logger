import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getWeightHistory, getStrengthHistory } from './actions'
import { getConsistencyData, getDailyPhotos } from './consistencyActions'
import WeightChart from '@/components/dashboard/WeightChart'
import StrengthChart from '@/components/dashboard/StrengthChart'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [weightRes, strengthRes, consistencyRes, photosRes] = await Promise.all([
    getWeightHistory(30),
    getStrengthHistory(90),
    getConsistencyData(),
    getDailyPhotos()
  ])

  const weightHistory = weightRes.data || []
  const strengthHistory = strengthRes.data || []
  const consistency = consistencyRes.data || { score: 0, days: [] }
  const photos = photosRes.data || []

  return (
    <div className="p-4 sm:p-8 pb-24">
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

        {/* Consistency Score Row */}
        <section className="rounded-3xl bg-[#00FF41]/5 p-8 ring-1 ring-[#00FF41]/20 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="1"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/></svg>
          </div>
          
          <div className="relative h-32 w-32 shrink-0">
             <svg viewBox="0 0 36 36" className="h-full w-full">
                <path className="stroke-zinc-800" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-[#00FF41]" strokeWidth="2" strokeDasharray={`${consistency.score}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-bold text-white leading-none">{consistency.score}</span>
                <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-tighter">Score</span>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
             <h2 className="font-mono text-xl font-bold text-white uppercase tracking-tight">Consistency Protocol</h2>
             <p className="text-zinc-400 text-xs font-mono leading-relaxed max-w-md">
               Din poengsum er basert på disiplin rundt makro-mål og treningsfrekvens de siste 7 dagene. 
               Oppretthold 90+ for optimal biomekanisk adapsjon.
             </p>
             <div className="flex gap-2 pt-2 justify-center md:justify-start">
                {consistency.days.map((d, i) => (
                   <div key={i} className={`h-1.5 w-6 rounded-full ${d.score >= 100 ? 'bg-[#00FF41]' : d.score >= 50 ? 'bg-[#3B82F6]' : 'bg-zinc-800'}`} title={d.date} />
                ))}
             </div>
          </div>
        </section>

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

        {/* Strength trends */}
        <section className="space-y-4">
          <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Styrkeutvikling (1RM Trender)</h2>
          {strengthHistory.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {strengthHistory.map((ex: any) => (
                <StrengthChart 
                  key={ex.name} 
                  exerciseName={ex.name} 
                  data={ex.data} 
                />
              ))}
            </div>
          ) : (
            <div className="h-48 rounded-3xl border border-dashed border-zinc-800 flex items-center justify-center bg-white/5">
               <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest text-center px-8 text-balance">
                 Ingen styrkedata tilgjengelig. Loggfør øvelser med vekt for å se trender her.
               </p>
            </div>
          )}
        </section>

        {/* Photo Log Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between ml-1">
              <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Bio-Visual Log (Photos)</h2>
              <button className="font-mono text-[8px] text-[#00FF41] uppercase border border-[#00FF41]/30 px-3 py-1 rounded-full hover:bg-[#00FF41]/10 transition-all">
                + LAST OPP BILDE
              </button>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.length > 0 ? (
                photos.map(p => (
                   <div key={p.id} className="aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/10 group relative">
                      <img src={p.image_url} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="font-mono text-[8px] text-white uppercase">{new Date(p.logged_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                ))
              ) : (
                 <div className="col-span-full h-32 rounded-3xl border border-dashed border-zinc-800 flex items-center justify-center bg-white/5">
                    <p className="font-mono text-[9px] text-zinc-700 uppercase">Ingen dagsform-bilder logget ennå</p>
                 </div>
              )}
           </div>
        </section>
      </div>
    </div>
  )
}
