import { createClient } from '@/utils/supabase/server'
import DailySummary from '@/components/dashboard/DailySummary'
import GlycogenClock from '@/components/dashboard/GlycogenClock'
import CNSMeter from '@/components/dashboard/CNSMeter'
import MealTimer from '@/components/dashboard/MealTimer'
import DailyLogList from '@/components/dashboard/DailyLogList'
import BiometricTelemetry from '@/components/dashboard/BiometricTelemetry'
import MissionCommandCenter from '@/components/dashboard/MissionCommandCenter'
import TacticalFueling from '@/components/dashboard/TacticalFueling'
import HydrateCockpit from '@/components/dashboard/HydrateCockpit'
import DateNavigator from '@/components/dashboard/DateNavigator'
import Link from 'next/link'
import { getDailyTotals } from './actions'
import { getLatestBiometrics } from './profile/garminActions'
import { generateGuidance } from '@/lib/metabolism/guidance'
import { generateAIGuidance } from '@/lib/ai/guidanceGenerator'
import { format, addDays, subDays, isToday, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { prisma, getSafePrisma } from '@/lib/prisma'
import { getI18nServer } from '@/lib/i18n/server'

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const { t } = await getI18nServer()

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
  let dailyData: any = { protein: 0, carbs: 0, fat: 0, calories: 0, recentLogs: [], proteinGoal: 180, calorieGoal: 2500, goal: 'MAINTAIN' };
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
  const ruleBasedBriefing = generateGuidance(
    biometrics,
    { ...dailyData, goal: dailyData.proteinGoal || 180 },
    recentWorkouts
  )

  // Call GPT-4o for advanced mission analysis
  const aiBriefing = isCurrentToday 
    ? await generateAIGuidance(
        biometrics,
        { ...dailyData, goal: dailyData.proteinGoal || 180 },
        recentWorkouts
      )
    : null

  const prevDate = format(subDays(currentDate, 1), 'yyyy-MM-dd')
  const nextDate = format(addDays(currentDate, 1), 'yyyy-MM-dd')

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6 sm:p-12">
      <HydrateCockpit 
        baseline={{ 
          weight: dailyData.weight ?? 85, 
          proteinGoal: dailyData.proteinGoal ?? 180,
          calorieGoal: dailyData.calorieGoal ?? 2500,
          goal: dailyData.goal ?? 'MAINTAIN',
          language: dailyData.language ?? 'NB'
        }}
        dailyTotals={dailyData}
        recentWorkouts={recentWorkouts}
      />
      
      {/* Date Navigation */}
      <DateNavigator 
        currentDate={format(currentDate, 'yyyy-MM-dd')}
        displayDate={displayDate}
        prevDate={prevDate}
        nextDate={nextDate}
        isCurrentToday={isCurrentToday}
      />

      {/* AI Mission Command Center */}
      {isCurrentToday && (
        <MissionCommandCenter 
          briefing={aiBriefing} 
          fallbackBriefing={ruleBasedBriefing} 
        />
      )}

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">{t('dashboard.indicators')}</h2>
          <div className="grid grid-cols-2 gap-4">
              <GlycogenClock />
              <CNSMeter />
              <div className="col-span-2">
                <MealTimer />
              </div>
          </div>
          
          <TacticalFueling />
          <BiometricTelemetry />
        </div>

        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">{t('dashboard.nutrition')}</h2>
          <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg h-full">
              <DailySummary serverData={dailyData} isHistorical={!isCurrentToday} />
          </div>
        </div>
      </section>

      {/* Operation Log */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest">{t('dashboard.daily_log')} {displayDate}</h2>
        <DailyLogList logs={dailyData.recentLogs} isHistorical={!isCurrentToday} />
      </section>

      <section className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
         <Link 
          href="/library" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#00FF41]">{t('navigation.library')}</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{t('navigation.library_desc')}</p>
         </Link>
         <Link 
          href="/training" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#3B82F6]">{t('navigation.log_workout')}</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{t('navigation.log_workout_desc')}</p>
         </Link>
         <Link 
          href="/training/exercises" 
          className="flex-1 min-w-[200px] rounded-xl bg-[#3B82F6]/5 p-6 ring-1 ring-[#3B82F6]/20 hover:bg-[#3B82F6]/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#3B82F6]">ØVELSESBIBLIOTEK</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">Biomekanisk Database</p>
         </Link>
         <Link 
          href="/history" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#F59E0B]">{t('navigation.history')}</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{t('navigation.history_desc')}</p>
         </Link>
         <Link 
          href="/profile" 
          className="flex-1 min-w-[200px] rounded-xl bg-white/5 p-6 ring-1 ring-white/10 hover:bg-white/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-white">{t('navigation.profile')}</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{t('navigation.profile_desc')}</p>
         </Link>
         <Link 
          href="/progress" 
          className="flex-1 min-w-[200px] rounded-xl bg-[#00FF41]/5 p-6 ring-1 ring-[#00FF41]/20 hover:bg-[#00FF41]/10 transition-all group"
         >
            <h3 className="font-mono text-sm font-bold text-[#00FF41]">{t('navigation.progress')}</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{t('navigation.progress_desc')}</p>
         </Link>
      </section>
    </main>
  )
}
