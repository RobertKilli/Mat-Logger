'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/hooks/useI18n'

interface DateNavigatorProps {
  currentDate: string // ISO date string (YYYY-MM-DD)
  displayDate: string
  prevDate: string
  nextDate: string
  isCurrentToday: boolean
}

export default function DateNavigator({
  currentDate,
  displayDate,
  prevDate,
  nextDate,
  isCurrentToday
}: DateNavigatorProps) {
  const router = useRouter()
  const { t } = useI18n()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (newDate) {
      router.push(`/?date=${newDate}`)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#141416] p-4 ring-1 ring-white/10 shadow-lg relative overflow-hidden">
      {/* Visual Glitch/Border accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF41]/20 to-transparent" />
      
      <Link 
        href={`/?date=${prevDate}`}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-95 group"
      >
        <span className="sr-only">Forrige dag</span>
        <svg 
          className="text-zinc-400 group-hover:text-[#00FF41] transition-colors"
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </Link>
      
      <div className="text-center group relative cursor-pointer min-w-[200px]">
        <h2 className="font-mono text-lg font-bold text-[#00FF41] tracking-widest group-hover:text-white transition-all uppercase drop-shadow-[0_0_8px_rgba(0,255,65,0.3)]">
          {displayDate}
        </h2>
        
        {/* Hidden but functional date picker */}
        <input 
          type="date" 
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          onChange={handleDateChange}
          value={currentDate}
          title={t('dashboard.pick_date')}
        />
        
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] text-zinc-500 font-mono pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap bg-black/40 px-2 rounded">
          {t('dashboard.pick_date')}
        </div>
      </div>

      <Link 
        href={isCurrentToday ? '#' : `/?date=${nextDate}`}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 group ${isCurrentToday ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'}`}
        aria-disabled={isCurrentToday}
      >
        <span className="sr-only">Neste dag</span>
        <svg 
          className={isCurrentToday ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-[#00FF41] transition-colors'}
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </Link>
    </div>
  )
}
