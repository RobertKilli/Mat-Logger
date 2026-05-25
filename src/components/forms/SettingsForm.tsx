'use client'

import { useState, useEffect } from 'react'
import { updateSettings } from '@/app/(dashboard)/settings/actions'
import { UserGoal, Language } from '@prisma/client'

interface SettingsFormProps {
  initialData: {
    display_name: string | null
    theme_color: string | null
    calorie_goal: number | null
    goal: UserGoal
    weight: number | null
    language: Language
  }
}

const PRESET_COLORS = [
  { name: 'Neon Green', value: '#00FF41' },
  { name: 'Cyan Blue', value: '#00F0FF' },
  { name: 'Plasma Purple', value: '#BC00FF' },
  { name: 'Solar Orange', value: '#FF8A00' },
  { name: 'Alert Red', value: '#FF0000' },
]

const GOALS: { value: UserGoal; label: string; desc: string; offset: number }[] = [
  { value: 'BULK', label: 'BULK', desc: 'Muskelvekst', offset: 500 },
  { value: 'MAINTAIN', label: 'VEDLIKEHOLD', desc: 'Stabil vekt', offset: 0 },
  { value: 'CUT', label: 'DEFF', desc: 'Fettforbrenning', offset: -500 },
]

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'NB', label: 'NORSK', flag: '🇳🇴' },
  { value: 'EN', label: 'ENGLISH', flag: '🇬🇧' },
]

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialData.display_name || 'Pilot')
  const [themeColor, setThemeColor] = useState(initialData.theme_color || '#00FF41')
  const [calorieGoal, setCalorieGoal] = useState(initialData.calorie_goal?.toString() || '2500')
  const [goal, setGoal] = useState<UserGoal>(initialData.goal)
  const [language, setLanguage] = useState<Language>(initialData.language)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Automatisk beregning basert på vekt og mål
  const calculateRecommended = (selectedGoal: UserGoal) => {
    if (!initialData.weight) return null
    const maintenance = Math.round(initialData.weight * 33) // Standard faktor
    const offset = GOALS.find(g => g.value === selectedGoal)?.offset || 0
    return maintenance + offset
  }

  const handleApplyRecommended = () => {
    const recommended = calculateRecommended(goal)
    if (recommended) {
      setCalorieGoal(recommended.toString())
      setMessage({ type: 'success', text: `Anbefalt nivå (${recommended} kcal) aktivert for ${goal}.` })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await updateSettings({ 
      display_name: displayName, 
      theme_color: themeColor,
      calorie_goal: parseInt(calorieGoal),
      goal,
      language
    })
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Cockpit konfigurasjon lagret.' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Kunne ikke lagre innstillinger.' })
    }
    setLoading(false)
  }

  const recommendedCal = calculateRecommended(goal)

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Profil Seksjon */}
      <section className="space-y-6">
        <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Profil_Data</h3>
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
        </div>
      </section>

      {/* Misjonsmål Seksjon */}
      <section className="space-y-6">
        <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Operasjonelle_Mål</h3>
        
        <div className="space-y-4">
          <label className="block text-[10px] font-mono uppercase text-zinc-500 tracking-widest text-center">Valgt Strategi</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(g.value)}
                className={`flex flex-col items-center justify-center rounded-xl p-4 transition-all ring-1 ${
                  goal === g.value 
                    ? 'bg-[#00FF41]/10 ring-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]' 
                    : 'bg-white/5 ring-white/10 hover:bg-white/10'
                }`}
              >
                <span className={`font-mono text-xs font-bold ${goal === g.value ? 'text-[#00FF41]' : 'text-zinc-400'}`}>{g.label}</span>
                <span className="mt-1 font-mono text-[8px] text-zinc-600 uppercase">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 tracking-widest text-center mb-2">Daglig Kalorigrense (KCAL)</label>
            <input 
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              className="w-full bg-transparent border-0 text-center font-mono text-6xl font-bold text-white focus:ring-0"
              placeholder="2500"
            />
          </div>

          {initialData.weight ? (
            <div className="flex flex-col items-center gap-3">
              <p className="font-mono text-[9px] text-zinc-500 uppercase">
                Basert på vekt ({initialData.weight}kg) anbefales: <span className="text-white font-bold">{recommendedCal} kcal</span>
              </p>
              <button
                type="button"
                onClick={handleApplyRecommended}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 font-mono text-[9px] font-bold text-[#00FF41] hover:bg-[#00FF41]/10 transition-all uppercase tracking-widest"
              >
                Bruk Anbefalt Verdi
              </button>
            </div>
          ) : (
            <p className="font-mono text-[8px] text-zinc-600 text-center uppercase">
              Sett vekt i profilen for å få anbefalt mål
            </p>
          )}
        </div>
      </section>

      {/* Språk Seksjon */}
      <section className="space-y-6">
        <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">System_Språk</h3>
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setLanguage(lang.value)}
              className={`flex items-center gap-3 rounded-xl p-4 transition-all ring-1 ${
                language === lang.value 
                  ? 'bg-white/10 ring-white/30 shadow-lg' 
                  : 'bg-white/5 ring-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className={`font-mono text-xs font-bold ${language === lang.value ? 'text-white' : 'text-zinc-500'}`}>{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Utseende Seksjon */}
      <section className="space-y-6">
        <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Cockpit_Estetikk</h3>
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
      </section>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
         <h3 className="font-mono text-[10px] text-zinc-500 uppercase">Forhåndsvisning</h3>
         <div className="space-y-2">
            <p className="font-mono text-xs uppercase" style={{ color: themeColor }}>Status: {goal} ENABLED ({language})</p>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
               <div className="h-full w-[65%] transition-all" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}66` }} />
            </div>
            <div className="flex justify-between items-center mt-1">
               <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Target: {calorieGoal} KCAL/DAY</p>
               <p className="font-mono text-[8px] text-zinc-600 uppercase">Diff: {parseInt(calorieGoal) - (recommendedCal || 0)} KCAL</p>
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
