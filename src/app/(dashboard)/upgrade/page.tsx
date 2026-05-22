'use client'

import Link from 'next/link'

const TIERS = [
  {
    id: 'FREE',
    name: 'CADET',
    price: '0,-',
    description: 'Grunnleggende overvåking for nye rekrutter.',
    features: [
      'Ubegrenset matlogging (manuell)',
      'Push / Pull / Legs treningslogg',
      '7 dager historikk',
      'Pilot-profil baseline',
      'Basalstoffskifte kalkulator',
    ],
    cta: 'NÅVÆRENDE STATUS',
    current: true,
  },
  {
    id: 'PREMIUM',
    name: 'ELITE PILOT',
    price: '99,-',
    period: '/mnd',
    description: 'Full cockpit-tilgang med avansert analyse.',
    features: [
      'Alt i Cadet-versjonen',
      'Ubegrenset historikk',
      'Smart Lookup (Hent fra nett)',
      'Full matdatabase-søk (OFF)',
      'Detaljert manko-analyse',
      'CNS & Glykogen-indikatorer',
      'Prioritert data-synkronisering',
    ],
    cta: 'OPPGRADER COCKPIT',
    highlight: true,
  },
]

export default function UpgradePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="text-center space-y-4 mb-16">
        <h1 className="font-mono text-4xl font-bold tracking-tighter text-[#00FF41] uppercase">
          Oppgrader ditt operasjonssenter
        </h1>
        <p className="mx-auto max-w-2xl text-zinc-500 font-mono text-xs uppercase tracking-widest">
          Velg ditt nivå av støtte for å maksimere fysiologisk output.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {TIERS.map((tier) => (
          <div 
            key={tier.id}
            className={`relative rounded-3xl p-8 ring-1 transition-all ${
              tier.highlight 
                ? 'bg-white/5 ring-[#00FF41] shadow-[0_0_50px_-12px_rgba(0,255,65,0.2)]' 
                : 'bg-[#141416] ring-white/10'
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#00FF41] px-4 py-1 text-[10px] font-bold text-black uppercase tracking-tighter">
                Anbefalt av HQ
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="font-mono text-xl font-bold text-white tracking-tight">{tier.name}</h2>
                  <p className="mt-2 text-xs text-zinc-500">{tier.description}</p>
               </div>
               <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="font-mono text-3xl font-bold text-white">{tier.price}</span>
                    {tier.period && <span className="ml-1 text-[10px] text-zinc-500">{tier.period}</span>}
                  </div>
               </div>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg 
                    className={`h-4 w-4 shrink-0 ${tier.highlight ? 'text-[#00FF41]' : 'text-zinc-700'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-tight">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={tier.current}
              className={`w-full rounded-xl py-4 font-mono text-xs font-bold uppercase transition-all ${
                tier.current 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-[#00FF41] text-black hover:bg-[#00FF41]/90 shadow-lg'
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
         <Link href="/" className="font-mono text-[10px] text-zinc-600 uppercase underline decoration-zinc-800 hover:text-[#00FF41]">
           Gå tilbake til kommando-sentralen
         </Link>
      </div>
    </main>
  )
}
