'use client'

import { useState } from 'react'
import { getPBHistory } from '@/app/(dashboard)/progress/actions'
import { format } from 'date-fns'

interface PBHistoryContentProps {
  initialPBs: any[]
}

export default function PBHistoryContent({ initialPBs }: PBHistoryContentProps) {
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSelect(pb: any) {
    setSelectedExercise(pb)
    setLoading(true)
    const res = await getPBHistory(pb.id)
    setHistory(res.data || [])
    setLoading(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Exercise List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Current Records</h2>
        <div className="space-y-2">
          {initialPBs.map((pb) => (
            <button
              key={pb.id}
              onClick={() => handleSelect(pb)}
              className={`w-full text-left p-4 rounded-xl ring-1 transition-all group ${selectedExercise?.id === pb.id ? 'bg-[#00FF41]/10 ring-[#00FF41]/30' : 'bg-white/5 ring-white/10 hover:bg-white/10'}`}
            >
              <p className="font-mono text-[8px] text-zinc-500 uppercase mb-1 tracking-widest">{pb.category}</p>
              <div className="flex justify-between items-baseline">
                 <h3 className="font-bold text-sm text-white group-hover:text-[#00FF41]">{pb.name.toUpperCase()}</h3>
                 <p className="font-mono text-lg font-bold text-[#00FF41]">{pb.weight}kg</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History View */}
      <div className="lg:col-span-2 space-y-6">
        {selectedExercise ? (
          <div className="rounded-3xl bg-[#141416] p-8 ring-1 ring-white/10 shadow-2xl relative overflow-hidden h-full">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="0.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
            </div>

            <div className="relative z-10">
              <header className="mb-12">
                 <p className="font-mono text-[10px] text-[#00FF41] uppercase tracking-[0.3em] mb-2">Operational_History</p>
                 <h2 className="font-mono text-3xl font-black text-white tracking-tighter uppercase">{selectedExercise.name}</h2>
              </header>

              {loading ? (
                 <div className="h-64 flex items-center justify-center font-mono text-xs text-zinc-600 animate-pulse">RETRIEVING_ARCHIVE_DATA...</div>
              ) : (
                <div className="space-y-8">
                   {/* Timeline */}
                   <div className="relative border-l border-zinc-800 ml-4 pl-8 space-y-12 pb-8">
                      {history.map((entry, i) => (
                         <div key={i} className="relative group">
                            <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-black ring-2 ring-zinc-800 group-hover:ring-[#00FF41] transition-all flex items-center justify-center">
                               <div className={`h-1.5 w-1.5 rounded-full ${i === history.length - 1 ? 'bg-[#00FF41] animate-ping' : 'bg-zinc-700'}`} />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                               <div className="flex-1">
                                  <p className="font-mono text-[9px] text-zinc-600 uppercase mb-1">{format(new Date(entry.date), 'dd.MM.yyyy')}</p>
                                  <h4 className="font-mono text-2xl font-bold text-white tracking-tighter">
                                     {entry.weight}
                                     <span className="text-xs text-zinc-500 ml-2 uppercase">kg reached</span>
                                  </h4>
                               </div>
                               
                               {i > 0 && (
                                  <div className="bg-[#00FF41]/5 px-4 py-2 rounded-lg border border-[#00FF41]/10">
                                     <p className="font-mono text-[8px] text-[#00FF41] uppercase mb-0.5">Incremental_Gain</p>
                                     <p className="font-mono text-xs font-bold text-white">+{Math.round((entry.weight - history[i-1].weight)*10)/10}kg</p>
                                  </div>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   {history.length < 2 && (
                      <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-black/20">
                         <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">Single entry detected. Further data required for trend analysis.</p>
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-white/5 p-12 text-center">
             <div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-zinc-700 mb-4 opacity-50"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest max-w-[200px] leading-relaxed">
                   Select operational protocol from the registry to view historical strength telemetry.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
