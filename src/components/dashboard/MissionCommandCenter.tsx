'use client'

import { MissionBriefing } from '@/lib/metabolism/guidance'
import { useI18n } from '@/hooks/useI18n'

interface MissionCommandCenterProps {
  briefing: MissionBriefing
}

export default function MissionCommandCenter({ briefing }: MissionCommandCenterProps) {
  const { t } = useI18n()
  const typeColors = {
    OPTIMAL: 'border-[#00FF41] bg-[#00FF41]/5 text-[#00FF41]',
    CAUTION: 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500',
    REST: 'border-red-500 bg-red-500/5 text-red-500',
    FUEL: 'border-blue-500 bg-blue-500/5 text-blue-500',
  }

  const icons = {
    OPTIMAL: '✓',
    CAUTION: 'ℹ',
    REST: '⚠️',
    FUEL: '⛽',
  }

  return (
    <div className={`rounded-2xl border p-6 shadow-2xl transition-all ${typeColors[briefing.type]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-bold">{icons[briefing.type]}</span>
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">{t('dashboard.mission_command')}</h2>
            <p className="font-mono text-[10px] opacity-70 uppercase tracking-widest">{briefing.title}</p>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
      </div>

      <p className="font-mono text-sm leading-relaxed mb-6">
        {briefing.message}
      </p>

      {briefing.actionItem && (
        <div className="rounded-lg bg-black/20 p-4 border border-current/20">
           <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-60">PRIORITY_ACTION:</p>
           <p className="font-mono text-xs font-bold italic">"{briefing.actionItem}"</p>
        </div>
      )}
    </div>
  )
}
