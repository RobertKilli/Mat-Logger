'use client'

import { useI18n } from '@/hooks/useI18n'
import { AIMissionBriefing } from '@/lib/ai/guidanceGenerator'

interface MissionCommandCenterProps {
  briefing: AIMissionBriefing | null
  fallbackBriefing?: {
    type: string
    title: string
    message: string
    actionItem?: string
  }
}

export default function MissionCommandCenter({ briefing, fallbackBriefing }: MissionCommandCenterProps) {
  const { t } = useI18n()

  const status = briefing?.status || (fallbackBriefing?.type as any) || 'STABLE'
  
  const typeColors: Record<string, string> = {
    OPTIMAL: 'border-[#00FF41] bg-[#00FF41]/5 text-[#00FF41]',
    STABLE: 'border-[#00FF41]/50 bg-[#00FF41]/5 text-[#00FF41]/80',
    CAUTION: 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500',
    ELEVATED: 'border-orange-500/50 bg-orange-500/5 text-orange-500',
    HIGH: 'border-red-500/70 bg-red-500/5 text-red-500',
    CRITICAL: 'border-red-600 bg-red-600/10 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]',
    REST: 'border-red-500 bg-red-500/5 text-red-500',
    FUEL: 'border-blue-500 bg-blue-500/5 text-blue-500',
  }

  const icons: Record<string, string> = {
    OPTIMAL: '✓',
    STABLE: '○',
    CAUTION: 'ℹ',
    ELEVATED: '⚠',
    HIGH: '⚡',
    CRITICAL: '✖',
    REST: '⚠️',
    FUEL: '⛽',
  }

  const displayStatus = status.toUpperCase()
  const colorClass = typeColors[displayStatus] || typeColors.STABLE
  const icon = icons[displayStatus] || icons.STABLE

  return (
    <div className={`rounded-3xl border p-8 shadow-2xl transition-all duration-700 ${colorClass} relative overflow-hidden`}>
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center border border-current/20 text-2xl font-bold">
              {icon}
            </div>
            <div>
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.3em] opacity-60">{t('dashboard.mission_command')}</h2>
              <p className="font-mono text-lg font-black tracking-tighter uppercase">{briefing?.mission_briefing || fallbackBriefing?.title || 'System initialized'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] uppercase tracking-widest opacity-40">Status</span>
                <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
             </div>
             <span className="font-mono text-[10px] font-bold tracking-widest">{displayStatus}</span>
          </div>
        </div>

        {briefing ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-black/20 border border-current/10">
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-50">Recovery_Analysis</p>
                  <p className="font-mono text-xs leading-relaxed text-zinc-300">{briefing.recovery_analysis}</p>
               </div>
               <div className="p-4 rounded-xl bg-black/20 border border-current/10">
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-50">Nutrition_Report</p>
                  <p className="font-mono text-xs leading-relaxed text-zinc-300">{briefing.nutrition_analysis}</p>
               </div>
            </div>
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-black/20 border border-current/10">
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-50">Biomechanical_Trends</p>
                  <p className="font-mono text-xs leading-relaxed text-zinc-300">{briefing.training_analysis}</p>
               </div>
               <div className="p-4 rounded-xl bg-black/20 border border-current/10 h-full">
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-50">Pilot_Status</p>
                  <p className="font-mono text-xs leading-relaxed text-zinc-300">{briefing.pilot_status}</p>
               </div>
            </div>
          </div>
        ) : (
          <p className="font-mono text-sm leading-relaxed mb-6 text-zinc-300">
            {fallbackBriefing?.message}
          </p>
        )}

        {(briefing?.priority_action || fallbackBriefing?.actionItem) && (
          <div className="mt-8 rounded-2xl bg-[#00FF41]/10 p-5 border border-[#00FF41]/30 shadow-lg group hover:bg-[#00FF41]/15 transition-all">
             <div className="flex items-center gap-3 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#00FF41]"><path d="M12 2v20M2 12h20"/></svg>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF41]">PRIORITY_ACTION</p>
             </div>
             <p className="font-mono text-sm font-bold italic text-white group-hover:translate-x-1 transition-transform">
               "{briefing?.priority_action || fallbackBriefing?.actionItem}"
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
