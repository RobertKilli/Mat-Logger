'use client'

import { useEffect, useState } from 'react'
import FoodSearch from '@/components/dashboard/FoodSearch'
import { getCategorizedLibrary } from './actions'
import { getMealTemplates } from '../quick-log/actions'
import { FoodCategory } from '@prisma/client'
import Link from 'next/link'
import MealTemplateList from '@/components/dashboard/MealTemplateList'
import MealBuilderStatus from '@/components/dashboard/MealBuilderStatus'
import { useI18n } from '@/hooks/useI18n'

const CATEGORY_LABELS: Record<string, string> = {
  MEAT: 'Kjøtt',
  FISH: 'Fisk',
  FRUIT: 'Frukt',
  VEGETABLE: 'Grønnsaker',
  DAIRY: 'Meieri',
  GRAIN: 'Korn & Brød',
  SUPPLEMENT: 'Kosttilskudd',
  OTHER: 'Annet',
}

export default function LibraryPage() {
  const { t } = useI18n()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [libraryResponse, templatesResponse] = await Promise.all([
        getCategorizedLibrary(),
        getMealTemplates()
      ])
      setData({
        categorized: libraryResponse?.data || {},
        templates: templatesResponse?.data || []
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-mono text-xs text-[#00FF41] uppercase tracking-widest">
        {t('common.loading')}
      </div>
    )
  }

  const { categorized, templates } = data
  const categories = Object.keys(categorized) as FoodCategory[]

  return (
    <div className="p-4 sm:p-8 pb-32">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
              title={t('common.back')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
                {t('library.title')}
              </h1>
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-0.5">
                {t('library.pilot_access')}: OPERATIONAL
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-2xl bg-[#141416] p-6 ring-1 ring-white/10 shadow-2xl">
          <FoodSearch />
        </div>

        {/* Meal Templates Section */}
        {templates.length > 0 && (
          <section className="space-y-4">
             <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">{t('library.meal_templates')}</h2>
             <MealTemplateList templates={templates} />
          </section>
        )}

        {/* Categorized Lists */}
        <section className="space-y-10">
          <h2 className="font-mono text-xs uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">{t('library.recent_items')}</h2>
          
          {categories.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/5">
              <p className="font-mono text-xs text-zinc-600 uppercase">{t('library.no_results')}</p>
            </div>
          ) : (
            categories.sort().map(cat => (
              <div key={cat} className="space-y-4">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00FF41]" />
                  {CATEGORY_LABELS[cat] || cat}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categorized[cat].map((item: any) => (
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
                        <p className="font-mono text-[9px] text-zinc-500">{Math.round(item.caloriesPer100g)} kcal / {item.baseAmount}{item.baseUnit === 'GRAM' ? 'g' : item.baseUnit === 'ML' ? 'ml' : 'stk'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <MealBuilderStatus />
      </div>
    </div>
  )
}
