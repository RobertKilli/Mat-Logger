import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutEntryForm from '@/components/forms/WorkoutEntryForm'
import Link from 'next/link'

export default async function TrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex items-center gap-4">
          <Link 
            href="/" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
            title="Tilbake til dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              LOG SESSION
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Neurological load tracking initialization</p>
          </div>
        </header>

        <div className="rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
          <WorkoutEntryForm />
        </div>
      </div>
    </div>
  )
}
