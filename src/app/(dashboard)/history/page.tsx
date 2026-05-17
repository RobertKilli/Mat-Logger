import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutHistory from '@/components/dashboard/WorkoutHistory'
import { getWorkoutHistory } from './actions'

interface WorkoutLog {
  id: string
  category: 'PUSH' | 'PULL' | 'LEGS'
  duration_minutes: number
  intensity: number
  logged_at: Date
}

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const response = await getWorkoutHistory()
  const logs = response.data || []

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              MISSION HISTORY
            </h1>
            <p className="text-zinc-400">Review past operational logs</p>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 font-mono text-[10px] text-zinc-500 ring-1 ring-white/10">
            TOTAL: {logs.length}
          </div>
        </header>

        <WorkoutHistory logs={logs as unknown as WorkoutLog[]} />
      </div>
    </div>
  )
}
