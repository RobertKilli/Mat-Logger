import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutEntryForm from '@/components/forms/WorkoutEntryForm'

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
        <header className="mb-12">
          <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
            LOG SESSION
          </h1>
          <p className="text-zinc-400">Initialize neurological load tracking</p>
        </header>

        <div className="rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
          <WorkoutEntryForm />
        </div>
      </div>
    </div>
  )
}
