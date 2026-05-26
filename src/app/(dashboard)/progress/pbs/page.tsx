import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PBHistoryContent from '@/components/dashboard/PBHistoryContent'
import { getPBs } from '../actions'

export default async function PBHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const pbRes = await getPBs()
  const currentPBs = pbRes.data || []

  return (
    <div className="p-4 sm:p-8 pb-24">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="flex items-center gap-4">
          <Link 
            href="/progress" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              WALL_OF_FAME
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Historical Strength Archive</p>
          </div>
        </header>

        <PBHistoryContent initialPBs={currentPBs} />
      </div>
    </div>
  )
}
