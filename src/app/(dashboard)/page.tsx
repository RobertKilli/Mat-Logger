import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import DailySummary from '@/components/dashboard/DailySummary'
import GlycogenClock from '@/components/dashboard/GlycogenClock'
import CNSMeter from '@/components/dashboard/CNSMeter'
import FeedbackLoop from '@/components/forms/FeedbackLoop'
import Link from 'next/link'
import { subDays } from 'date-fns'

interface WorkoutSummary {
  id: string
  intensity: number
  logged_at: Date
  subjective_fatigue: number | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch recent workouts for CNS calculation (last 7 days)
  const recentWorkouts: WorkoutSummary[] = await prisma.workoutLog.findMany({
    where: {
      user_id: user.id,
      logged_at: {
        gte: subDays(new Date(), 7),
      },
    },
    select: {
      id: true,
      intensity: true,
      logged_at: true,
      subjective_fatigue: true,
    },
  })

  // Find the most recent workout that hasn't been rated yet
  const pendingFeedback = recentWorkouts
    .filter(w => w.subjective_fatigue === null)
    .sort((a, b) => b.logged_at.getTime() - a.logged_at.getTime())[0]

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6 sm:p-12">
      {/* Feedback Loop Prompt */}
      {pendingFeedback && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
           <FeedbackLoop workoutId={pendingFeedback.id} />
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-2">
        {/* Main indicators */}
        <div className="space-y-4">
           <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Readiness Indicators</h2>
           <div className="grid grid-cols-2 gap-4">
              <GlycogenClock />
              <CNSMeter />
           </div>
        </div>

        <div className="space-y-4">
           <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Nutritional Status</h2>
           <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg">
              <DailySummary />
           </div>
        </div>
      </section>

      <section className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
         <Link 
          href="/library" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#00FF41]">OPEN LIBRARY</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Search & Log fuel sources</p>
         </Link>
         <Link 
          href="/training" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#3B82F6]">LOG SESSION</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Push / Pull / Legs</p>
         </Link>
         <Link 
          href="/history" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#F59E0B]">MISSION HISTORY</h3>
            <p color="text-zinc-500" className="text-xs text-zinc-500 mt-1 uppercase">Review past operations</p>
         </Link>
         <Link 
          href="/profile" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-white">PILOT PROFILE</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Configure baseline targets</p>
         </Link>
      </section>
    </main>
  )
}
