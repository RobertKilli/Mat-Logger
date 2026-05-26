'use client'

import { useI18n } from '@/hooks/useI18n'
import Link from 'next/link'

interface PBWallOfFameProps {
  pbs: {
    id: string
    name: string
    weight: number
    date: Date
    category: string
  }[]
}

export default function PBWallOfFame({ pbs }: PBWallOfFameProps) {
  const { t } = useI18n()

  if (pbs.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-baseline gap-4">
            <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Wall of Fame (PB Records)</h2>
            <span className="font-mono text-[8px] text-[#00FF41]">● VERIFIED_STATS</span>
         </div>
         <Link 
           href="/progress/pbs"
           className="font-mono text-[8px] font-bold text-[#00FF41] border border-[#00FF41]/30 px-3 py-1 rounded-full hover:bg-[#00FF41]/10 transition-all uppercase"
         >
           VIEW_FULL_ARCHIVE
         </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pbs.slice(0, 4).map((pb, i) => (
          <div key={i} className="rounded-2xl bg-gradient-to-br from-[#141416] to-[#1a1a1e] p-6 ring-1 ring-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-16 w-16 bg-[#00FF41]/10 rounded-full blur-2xl group-hover:bg-[#00FF41]/20 transition-all" />
            
            <p className="font-mono text-[8px] text-zinc-500 uppercase mb-2 tracking-widest">{pb.category} PROTOCOL</p>
            <h3 className="font-bold text-sm text-white truncate mb-4">{pb.name.toUpperCase()}</h3>
            
            <div className="flex items-baseline gap-2">
               <span className="font-mono text-3xl font-bold text-[#00FF41] tracking-tighter">{pb.weight}</span>
               <span className="font-mono text-xs text-zinc-500 uppercase">KG</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
               <span className="font-mono text-[7px] text-zinc-600 uppercase">{new Date(pb.date).toLocaleDateString()}</span>
               <div className="h-1 w-8 bg-[#00FF41]/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FF41] w-2/3" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
