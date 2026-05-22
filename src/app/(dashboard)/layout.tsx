import { createClient } from '@/utils/supabase/server'
import { logout } from '../(auth)/actions'
import { prisma } from '@/lib/prisma'
import { getDailyTotals } from './actions'
import HydrateCockpit from '@/components/dashboard/HydrateCockpit'
import SyncStatus from '@/components/layout/SyncStatus'
import { subDays } from 'date-fns'
import { redirect } from 'next/navigation'

interface WorkoutSummary {
  intensity: number
  logged_at: Date
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  // Ensure user record exists in our DB
  if (!dbUser && user.email) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        protein_goal: 0,
      }
    })
  }

  const totalsResponse = await getDailyTotals()
  const dailyTotalsData = totalsResponse.data || { protein: 0, carbs: 0, fat: 0, calories: 0, recentLogs: [] }
  const dailyTotals = {
    protein: dailyTotalsData.protein,
    carbs: dailyTotalsData.carbs,
    fat: dailyTotalsData.fat,
    calories: dailyTotalsData.calories,
    recentLogs: dailyTotalsData.recentLogs || []
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
      intensity: true,
      logged_at: true,
    },
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B] font-sans text-white">
      <HydrateCockpit 
        baseline={{ weight: dbUser?.weight ?? null, proteinGoal: dbUser?.protein_goal ?? 0 }}
        dailyTotals={dailyTotals}
        recentWorkouts={recentWorkouts}
      />
      
      <header className="border-b border-white/5 bg-[#141416]/50 p-6 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-mono text-xl font-bold tracking-tighter text-[#00FF41]">
              BODY COCKPIT v1.0
            </h1>
            <SyncStatus />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="font-mono text-[10px] text-red-500 uppercase hover:underline">
                Exit
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  )
}
