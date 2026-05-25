import { createClient } from '@/utils/supabase/server'
import { logout } from '../(auth)/actions'
import { prisma } from '@/lib/prisma'
import { getDailyTotals } from './actions'
import HydrateCockpit from '@/components/dashboard/HydrateCockpit'
import SyncStatus from '@/components/layout/SyncStatus'
import NotificationManager from '@/components/dashboard/NotificationManager'
import { subDays } from 'date-fns'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserGoal } from '@prisma/client'

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

  let dbUser: any = null;
  let dbStatus: 'ONLINE' | 'OFFLINE' = 'ONLINE';

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    // Ensure user record exists
    if (!dbUser && user.email) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          subscription_tier: 'PREMIUM',
          display_name: 'Pilot',
          theme_color: '#00FF41',
          calorie_goal: 2500,
          goal: 'MAINTAIN' as UserGoal
        }
      })
    }
  } catch (err) {
    console.error('CRITICAL_DB_FAILURE: System entering Fail-Safe mode.')
    dbStatus = 'OFFLINE';
    dbUser = {
       display_name: 'Pilot (SIM)',
       theme_color: '#00FF41',
       weight: 85,
       protein_goal: 180,
       calorie_goal: 2500,
       goal: 'MAINTAIN' as UserGoal
    }
  }

  // Safe fetch for dashboard metrics
  const totalsResponse = await getDailyTotals()
  const dailyTotalsData = totalsResponse.data || { 
    protein: 0, 
    carbs: 0, 
    fat: 0, 
    calories: 0, 
    recentLogs: [],
    proteinGoal: 180,
    calorieGoal: 2500,
    goal: 'MAINTAIN' as UserGoal
  }

  // Safe fetch for CNS calculation
  let recentWorkouts: WorkoutSummary[] = []
  try {
    if (dbStatus === 'ONLINE') {
        recentWorkouts = await prisma.workoutLog.findMany({
            where: { user_id: user.id, logged_at: { gte: subDays(new Date(), 7) } },
            select: { intensity: true, logged_at: true }
        })
    }
  } catch {
    recentWorkouts = []
  }

  const themeColor = dbUser?.theme_color || '#00FF41'
  const displayName = dbUser?.display_name || 'Pilot'

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B] font-sans text-white">
      <HydrateCockpit 
        baseline={{ 
          weight: dbUser?.weight ?? 85, 
          proteinGoal: dbUser?.protein_goal ?? 180,
          calorieGoal: dbUser?.calorie_goal ?? 2500,
          goal: dbUser?.goal ?? 'MAINTAIN'
        }}
        dailyTotals={dailyTotalsData as any}
        recentWorkouts={recentWorkouts}
      />
      
      <header className="border-b border-white/5 bg-[#141416]/50 p-6 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="group">
              <h1 className="font-mono text-xl font-bold tracking-tighter group-hover:opacity-80 transition-opacity" style={{ color: themeColor }}>
                BODY COCKPIT v1.0
              </h1>
            </Link>
            <SyncStatus />
            <NotificationManager />
            {dbStatus === 'OFFLINE' && (
               <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  <p className="font-mono text-[7px] text-red-500 font-bold animate-pulse">DATABASE_OFFLINE_FAILSAFE_ACTIVE</p>
               </div>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/settings" className="flex items-center gap-2 group">
               <div className="text-right hidden sm:block">
                  <p className="font-mono text-[10px] font-bold text-white uppercase">{displayName}</p>
                  <p className="font-mono text-[7px] text-zinc-500 uppercase">Config_Pilot</p>
               </div>
               <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
               </div>
            </Link>
            <form action={logout}>
              <button type="submit" className="font-mono text-[10px] text-red-500 uppercase hover:underline">
                Exit
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
