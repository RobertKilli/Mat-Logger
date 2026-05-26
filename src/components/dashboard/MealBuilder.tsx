'use client'

import { useState } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { saveMealAsTemplate } from '@/app/(dashboard)/quick-log/actions'
import { calculateNutrition } from '@/lib/metabolism/nutrition'
import { useI18n } from '@/hooks/useI18n'

interface MealBuilderProps {
  onCancel: () => void
  onSuccess: () => void
}

export default function MealBuilder({ onCancel, onSuccess }: MealBuilderProps) {
  const { t } = useI18n()
  const { mealBuilderQueue, removeFromMealBuilder, clearMealBuilder } = useCockpitStore()
  const [templateName, setTemplateName] = useState('')
  const [isSaving, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = mealBuilderQueue.reduce((acc, item) => {
    const calc = calculateNutrition(item.foodItem as any, item.inputMode as any, item.inputAmount)
    return {
      protein: acc.protein + calc.calculatedProtein,
      carbs: acc.carbs + calc.calculatedCarbs,
      fat: acc.fat + calc.calculatedFat,
      calories: acc.calories + calc.calculatedCalories,
    }
  }, { protein: 0, carbs: 0, fat: 0, calories: 0 })

  async function handleSaveTemplate() {
    if (!templateName.trim() || mealBuilderQueue.length === 0) return
    setIsSubmitting(true)
    setError(null)

    const res = await saveMealAsTemplate(
      templateName,
      mealBuilderQueue.map(i => ({
        foodItemId: i.foodItem.id,
        inputMode: i.inputMode as any,
        inputAmount: i.inputAmount
      }))
    )

    if (res.success) {
      clearMealBuilder()
      onSuccess()
    } else {
      setError(res.error || t('common.error'))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">{t('builder.title')}</h3>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {mealBuilderQueue.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <p className="font-mono text-[10px] text-zinc-600 uppercase">{t('builder.empty_desc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mealBuilderQueue.map(item => (
             <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl ring-1 ring-white/10">
                <div>
                   <p className="text-xs font-bold text-zinc-200">{item.foodItem.name}</p>
                   <p className="font-mono text-[9px] text-zinc-500">{item.inputAmount}{item.inputMode === 'GRAMS' ? 'g' : 'stk'}</p>
                </div>
                <button onClick={() => removeFromMealBuilder(item.id)} className="text-zinc-700 hover:text-red-500">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                </button>
             </div>
          ))}
        </div>
      )}

      {mealBuilderQueue.length > 0 && (
        <div className="p-4 rounded-xl bg-[#00FF41]/5 border border-[#00FF41]/10 space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center border-b border-white/5 pb-4">
             <div>
                <p className="font-mono text-xs font-bold text-white">{Math.round(totals.protein)}g</p>
                <p className="text-[7px] text-zinc-500 uppercase">P</p>
             </div>
             <div>
                <p className="font-mono text-xs font-bold text-white">{Math.round(totals.carbs)}g</p>
                <p className="text-[7px] text-zinc-500 uppercase">K</p>
             </div>
             <div>
                <p className="font-mono text-xs font-bold text-white">{Math.round(totals.fat)}g</p>
                <p className="text-[7px] text-zinc-500 uppercase">F</p>
             </div>
             <div>
                <p className="font-mono text-xs font-bold text-[#00FF41]">{Math.round(totals.calories)}</p>
                <p className="text-[7px] text-zinc-500 uppercase">Kcal</p>
             </div>
          </div>

          <div className="space-y-3">
            <input 
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t('builder.template_placeholder')}
              className="w-full rounded-lg bg-black/40 border-0 p-3 text-xs font-mono text-white ring-1 ring-[#00FF41]/20 focus:ring-2 focus:ring-[#00FF41] outline-none"
            />
            <button
              onClick={handleSaveTemplate}
              disabled={isSaving || !templateName.trim()}
              className="w-full rounded-lg bg-[#00FF41] py-3 text-xs font-bold text-black hover:bg-[#00FF41]/90 disabled:opacity-30 transition-all uppercase"
            >
              {isSaving ? t('builder.saving') : t('builder.save_template')}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-center font-mono text-[9px] text-red-500 uppercase">{error}</p>}
    </div>
  )
}
