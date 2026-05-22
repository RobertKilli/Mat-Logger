import FoodSearch from '@/components/dashboard/FoodSearch'
import { getCategorizedLibrary } from './actions'
import { FoodCategory } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  MEAT: 'Kjøtt',
  FISH: 'Fisk',
  FRUIT: 'Frukt',
  VEGETABLE: 'Grønnsaker',
  DAIRY: 'Meieri',
  GRAIN: 'Korn & Brød',
  SUPPLEMENT: 'Kosttilskudd',
  OTHER: 'Annet',
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userRecord = user ? await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscription_tier: true }
  }) : null

  const tier = userRecord?.subscription_tier || 'FREE'
  const response = await getCategorizedLibrary()
  const categorized = response?.data || {}
  
  const categories = Object.keys(categorized) as FoodCategory[]

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
              title="Tilbake til dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
                FOOD LIBRARY
              </h1>
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-0.5">
                Pilot access: {tier === 'PREMIUM' ? 'ELITE_PILOT' : 'CADET_LEVEL'}
              </p>
            </div>
          </div>
          
          {tier === 'FREE' && (
            <Link href="/upgrade" className="inline-block self-start rounded-lg bg-[#00FF41]/10 px-4 py-2 font-mono text-[10px] font-bold text-[#00FF41] ring-1 ring-[#00FF41]/20 hover:bg-[#00FF41]/20 transition-all mt-2">
               UPGRADE_TO_ELITE_FOR_AUTO_LOOKUP
            </Link>
          )}
        </header>

        <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-2xl">
          <FoodSearch />
        </div>

        {/* Categorized Lists */}
        <section className="space-y-10">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Dine mest brukte matvarer</h2>
          
          {categories.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/5">
              <p className="font-mono text-xs text-zinc-600 uppercase">Ditt bibliotek er tomt. Søk etter matvarer over for å begynne.</p>
            </div>
          ) : (
            categories.sort().map(cat => (
              <div key={cat} className="space-y-4">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF41]" />
                  {CATEGORY_LABELS[cat]}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categorized[cat].map(item => (
                    <Link 
                      key={item.id} 
                      href={`/quick-log?item=${item.id}`}
                      className="group flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-[8px] text-zinc-800">NO IMG</div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate font-bold text-sm text-zinc-300 group-hover:text-[#00FF41]">{item.name.toUpperCase()}</p>
                        <p className="font-mono text-[9px] text-zinc-500">{Math.round(item.calories)} kcal / {item.baseAmount}{item.baseUnit === 'GRAM' ? 'g' : item.baseUnit === 'ML' ? 'ml' : 'stk'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
