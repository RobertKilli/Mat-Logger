'use client'

import { useState } from 'react'
import { updateSettings } from '@/app/(dashboard)/settings/actions'

interface SettingsFormProps {
  initialData: {
    display_name: string | null
    theme_color: string | null
  }
}

const PRESET_COLORS = [
  { name: 'Neon Green', value: '#00FF41' },
  { name: 'Cyan Blue', value: '#00F0FF' },
  { name: 'Plasma Purple', value: '#BC00FF' },
  { name: 'Solar Orange', value: '#FF8A00' },
  { name: 'Alert Red', value: '#FF0000' },
]

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialData.display_name || 'Pilot')
  const [themeColor, setThemeColor] = useState(initialData.theme_color || '#00FF41')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await updateSettings({ display_name: displayName, theme_color: themeColor })
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Cockpit konfigurasjon lagret.' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Kunne ikke lagre innstillinger.' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Callsign / Visningsnavn</label>
          <input 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border-0 p-4 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[var(--theme-color)] outline-none font-mono"
            placeholder="Ditt pilot-navn"
            style={{ '--theme-color': themeColor } as any}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 tracking-widest">System Fargetema</label>
          <div className="flex flex-wrap gap-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setThemeColor(color.value)}
                className={`group relative h-12 w-12 rounded-full transition-all ${
                  themeColor === color.value ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {themeColor === color.value && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-black/40" />
                   </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
         <h3 className="font-mono text-[10px] text-zinc-500 uppercase">Forhåndsvisning av Grensesnitt</h3>
         <div className="space-y-2">
            <p className="font-mono text-xs uppercase" style={{ color: themeColor }}>Welcome_Back, {displayName.toUpperCase()}</p>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
               <div className="h-full w-[65%] transition-all" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}66` }} />
            </div>
         </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-5 font-mono text-sm font-bold uppercase transition-all shadow-lg active:scale-[0.98]"
        style={{ 
          backgroundColor: themeColor, 
          color: themeColor === '#00FF41' || themeColor === '#00F0FF' ? 'black' : 'white',
          boxShadow: `0 10px 20px -5px ${themeColor}33`
        }}
      >
        {loading ? 'OPPDATERER_SYSTEM...' : 'BEKREFT_KONFIGURASJON'}
      </button>

      {message && (
        <p className={`text-center font-mono text-[10px] uppercase font-bold ${message.type === 'error' ? 'text-red-500' : ''}`} style={{ color: message.type === 'success' ? themeColor : undefined }}>
           {message.text}
        </p>
      )}
    </form>
  )
}
