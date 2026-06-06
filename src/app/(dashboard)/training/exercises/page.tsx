// BODY_COCKPIT_OS: Route synchronization touch
import { prisma } from '@/lib/prisma'
import { TrainingCategory } from '@prisma/client'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ExerciseLibraryContent from '@/components/dashboard/ExerciseLibraryContent'

export default async function ExerciseLibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  })

  // Get PBs for each exercise
  const pbs = await prisma.workoutExercise.findMany({
    where: {
      workout_log: { user_id: user.id }
    },
    include: {
      workout_log: { select: { logged_at: true } }
    },
    orderBy: { weight: 'desc' }
  })

  // Group PBs by exercise_id (keep only the highest weight)
  const pbMap: Record<string, { weight: number, date: Date }> = {}
  pbs.forEach(p => {
    if (p.weight && (!pbMap[p.exercise_id] || p.weight > pbMap[p.exercise_id].weight)) {
      pbMap[p.exercise_id] = { weight: p.weight, date: p.workout_log.logged_at }
    }
  })

  return (
    <div className="p-4 sm:p-8 pb-24">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="flex items-center gap-4">
          <Link 
            href="/training" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#3B82F6]">
              EXERCISE_DATABASE
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Biomechanical Movement Registry</p>
          </div>
        </header>

        <ExerciseLibraryContent 
          exercises={exercises} 
          pbs={pbMap}
        />
      </div>
    </div>
  )
}
