import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UnifiedHistory from '@/components/dashboard/UnifiedHistory'
import { getUnifiedHistory } from './actions'
import Link from 'next/link'

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
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
              title="Tilbake til dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
                MISSION HISTORY
              </h1>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Operational parameter archive</p>
            </div>
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
