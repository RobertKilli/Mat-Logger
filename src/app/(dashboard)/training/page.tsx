import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutEntryForm from '@/components/forms/WorkoutEntryForm'
import Link from 'next/link'
import { getWorkoutTemplates } from './actions'

export default async function TrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: templates } = await getWorkoutTemplates()

  return (
    <div className="flex flex-col items-center px-4 py-12 font-sans text-white">
      <div className="w-full max-w-lg space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all ring-1 ring-white/10 font-mono text-[10px] text-zinc-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-mono text-2xl font-bold tracking-tighter text-[#3B82F6]">
                LOG_SESSION
              </h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Biometric tracking initialization</p>
            </div>
          </div>

          <Link 
            href="/training/exercises"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] ring-1 ring-[#3B82F6]/20 hover:bg-[#3B82F6]/20 transition-all"
            title="Øvelsesbibliotek"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
          </Link>
        </header>

        <div className="rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
          <WorkoutEntryForm templates={templates || []} />
        </div>
      </div>
    </div>
  )
}
