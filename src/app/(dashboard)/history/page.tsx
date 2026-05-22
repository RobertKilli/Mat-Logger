import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UnifiedHistory from '@/components/dashboard/UnifiedHistory'
import { getUnifiedHistory } from './actions'

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const response = await getUnifiedHistory()
  const history = response.data || []
  const proteinGoal = response.proteinGoal || 0

  return (
    <div className="p-4 sm:p-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              MISSION HISTORY
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Reviewing past operational parameters</p>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 font-mono text-[10px] text-zinc-500 ring-1 ring-white/10">
            TOTAL_DAYS: {history.length}
          </div>
        </header>

        <UnifiedHistory history={history as any} proteinGoal={proteinGoal} />
      </div>
    </div>
  )
}
