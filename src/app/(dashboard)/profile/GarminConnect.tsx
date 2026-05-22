'use client'

import { useState, useEffect } from 'react'
import { connectGarmin, disconnectGarmin, getGarminStatus } from './garminActions'

export default function GarminConnect() {
  const [status, setStatus] = useState<{ connected: boolean, lastSynced?: Date | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchStatus() {
      const res = await getGarminStatus()
      if (!('error' in res)) {
        setStatus(res)
      }
      setLoading(false)
    }
    fetchStatus()
  }, [])

  async function handleConnect() {
    setActionLoading(true)
    const res = await connectGarmin()
    if ('success' in res) {
      setStatus({ connected: true, lastSynced: new Date() })
    }
    setActionLoading(false)
  }

  async function handleDisconnect() {
    if (!confirm('Vil du koble fra Garmin Connect? Historiske data vil bli bevart.')) return
    setActionLoading(true)
    const res = await disconnectGarmin()
    if ('success' in res) {
      setStatus({ connected: false })
    }
    setActionLoading(false)
  }

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-xl" />

  return (
    <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-lg relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/></svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-tight">Garmin Connect</h3>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              {status?.connected ? `Status: TILKOBLET` : 'Status: IKKE TILKOBLET'}
            </p>
          </div>
        </div>

        <button
          onClick={status?.connected ? handleDisconnect : handleConnect}
          disabled={actionLoading}
          className={`rounded-lg px-4 py-2 font-mono text-[10px] font-bold transition-all ${
            status?.connected 
              ? 'bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
          }`}
        >
          {actionLoading ? 'BEHANDLER...' : (status?.connected ? 'KOBLE FRA' : 'KOBLE TIL')}
        </button>
      </div>

      {status?.connected && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[8px] text-zinc-600 uppercase">
           <span>Synkroniserer: Søvn, Puls, Stress</span>
           <span>Sist sync: {status.lastSynced ? new Date(status.lastSynced).toLocaleTimeString() : 'N/A'}</span>
        </div>
      )}
    </div>
  )
}
