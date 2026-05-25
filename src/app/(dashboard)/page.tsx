import { createClient } from '@/utils/supabase/server'
import DailySummary from '@/components/dashboard/DailySummary'
import GlycogenClock from '@/components/dashboard/GlycogenClock'
import CNSMeter from '@/components/dashboard/CNSMeter'
import MealTimer from '@/components/dashboard/MealTimer'
import DailyLogList from '@/components/dashboard/DailyLogList'
import BiometricTelemetry from '@/components/dashboard/BiometricTelemetry'
import MissionCommandCenter from '@/components/dashboard/MissionCommandCenter'
import Link from 'next/link'
import { getDailyTotals } from './actions'
import { getLatestBiometrics } from './profile/garminActions'
import { generateGuidance } from '@/lib/metabolism/guidance'
import { format, addDays, subDays, isToday, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { prisma, getSafePrisma } from '@/lib/prisma'

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { date } = await searchParams
  const currentDate = date ? parseISO(date) : new Date()
  
  const isCurrentToday = isToday(currentDate)
  const displayDate = isCurrentToday 
    ? 'I DAG' 
    : format(currentDate, 'd. MMMM yyyy', { locale: nb }).toUpperCase()

  // 1. Safe data fetching with strict guards
  let dailyData: any = { protein: 0, carbs: 0, fat: 0, calories: 0, recentLogs: [], proteinGoal: 180 };
  let biometrics: any[] = [];
  let recentWorkouts: any[] = [];

  try {
    const prisma = getSafePrisma();
    if (prisma) {
        const [totalsRes, bioRes] = await Promise.all([
            getDailyTotals(date),
            getLatestBiometrics()
        ]);
        
        dailyData = totalsRes.data || dailyData;
        biometrics = bioRes.data || [];
        
        try {
            recentWorkouts = await prisma.workoutLog.findMany({
                where: { user_id: user.id, logged_at: { gte: subDays(new Date(), 7) } },
                select: { intensity: true, logged_at: true }
            });
        } catch {
            recentWorkouts = [];
        }
    }
  } catch (err) {
    console.error('DASHBOARD_PAGE_FAILSAFE_ACTIVE: Switching to simulation.')
  }
  
  // 2. Generate AI Guidance (Mission Briefing)
  const briefing = generateGuidance(
    biometrics,
    { ...dailyData, goal: dailyData.proteinGoal || 180 },
    recentWorkouts
  )

  const prevDate = format(subDays(currentDate, 1), 'yyyy-MM-dd')
  const nextDate = format(addDays(currentDate, 1), 'yyyy-MM-dd')

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6 sm:p-12">
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-2xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-lg">
        <Link 
          href={`/?date=${prevDate}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="sr-only">Forrige dag</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        
        <div className="text-center">
          <h2 className="font-mono text-lg font-bold text-[#00FF41] tracking-widest">{displayDate}</h2>
        </div>

        <Link 
          href={isCurrentToday ? '#' : `/?date=${nextDate}`}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isCurrentToday ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'}`}
          aria-disabled={isCurrentToday}
        >
          <span className="sr-only">Neste dag</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      </div>

      {/* AI Mission Command Center */}
      {isCurrentToday && (
        <MissionCommandCenter briefing={briefing} />
      )}

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Klarhets-indikatorer</h2>
          <div className="grid grid-cols-2 gap-4">
              <GlycogenClock />
              <CNSMeter />
              <div className="col-span-2">
                <MealTimer />
              </div>
          </div>
          
          <BiometricTelemetry />
        </div>

        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Ernæringsstatus</h2>
          <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg h-full">
              <DailySummary serverData={dailyData} isHistorical={!isCurrentToday} />
          </div>
        </div>
      </section>

      {/* Operation Log */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">Dagbok for {displayDate}</h2>
        <DailyLogList logs={dailyData.recentLogs} isHistorical={!isCurrentToday} />
      </section>

      <section className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
         <Link 
          href="/library" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#00FF41]">ÅPNE BIBLIOTEK</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Søk & Logg drivstoff</p>
         </Link>
         <Link 
          href="/training" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#3B82F6]">LOGG ØKT</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Push / Pull / Legs</p>
         </Link>
         <Link 
          href="/history" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#F59E0B]">OPPERASJONSLOGG</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Se historiske data</p>
         </Link>
         <Link 
          href="/profile" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-white">PILOT PROFIL</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Konfigurer baseline</p>
         </Link>
      </section>
    </main>
  )
}
