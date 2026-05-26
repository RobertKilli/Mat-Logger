'use client'

import { useState } from 'react'
import { applyMealTemplate } from '@/app/(dashboard)/quick-log/actions'
import { MealType, MealTemplate, MealTemplateItem, FoodItem } from '@prisma/client'
import { useRouter } from 'next/navigation'

type FullTemplate = MealTemplate & {
  items: (MealTemplateItem & {
    food_item: FoodItem
  })[]
}

interface MealTemplateListProps {
  templates: FullTemplate[]
}

export default function MealTemplateList({ templates }: MealTemplateListProps) {
  const [applying, setApplying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleApply(templateId: string) {
    setApplying(templateId)
    setError(null)
    
    const res = await applyMealTemplate(templateId, 'LUNCH')
    if (res.success) {
      router.push('/')
      router.refresh()
    } else {
      setError(res.error || 'Kunne ikke loggføre måltid')
      setApplying(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[9px] uppercase">
          ⚠️ {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => {
          const totalCals = t.items.reduce((sum, item) => {
             return sum + (item.food_item.caloriesPer100g * (item.inputAmount / 100))
          }, 0)

          return (
            <div 
              key={t.id} 
              className="group flex flex-col gap-3 rounded-xl bg-[#00FF41]/5 p-4 ring-1 ring-[#00FF41]/20 hover:bg-[#00FF41]/10 transition-all"
            >
              <div className="flex justify-between items-start">
                 <div>
                    <p className="font-bold text-sm text-white group-hover:text-[#00FF41]">{t.name.toUpperCase()}</p>
                    <p className="font-mono text-[8px] text-zinc-500 uppercase">{t.items.length} varer • {Math.round(totalCals)} kcal</p>
                 </div>
                 <button 
                   onClick={() => handleApply(t.id)}
                   disabled={!!applying}
                   className="rounded-full bg-[#00FF41] px-3 py-1 font-mono text-[8px] font-bold text-black hover:scale-105 transition-all disabled:opacity-30"
                 >
                   {applying === t.id ? 'LOGGER...' : 'LOGG NÅ'}
                 </button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                 {t.items.slice(0, 3).map((item) => (
                    <span key={item.id} className="text-[7px] bg-black/40 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                      {item.food_item.name}
                    </span>
                 ))}
                 {t.items.length > 3 && <span className="text-[7px] text-zinc-600 font-mono">+{t.items.length - 3}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
