'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GramEntryForm from './GramEntryForm'
import { BaseUnit } from '@prisma/client'
import MealBuilder from '../dashboard/MealBuilder'

interface QuickLogFormProps {
  foodItem: {
    id: string
    name: string
    baseAmount: number
    baseUnit: BaseUnit
    gramsPerUnit: number | null
    servingSize: number | null
    servingUnit: string | null
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    caloriesPer100g: number
  }
}

export default function QuickLogForm({ foodItem }: QuickLogFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'SINGLE' | 'BUILDER'>('SINGLE')

  if (mode === 'BUILDER') {
    return (
      <MealBuilder 
        onCancel={() => setMode('SINGLE')} 
        onSuccess={() => router.push('/')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <GramEntryForm 
        foodItem={foodItem} 
        onSuccess={() => router.push('/')} 
      />
      
      <div className="pt-4 border-t border-white/5">
         <button 
           onClick={() => setMode('BUILDER')}
           className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-[10px] font-bold text-zinc-500 hover:text-[#00FF41] hover:bg-[#00FF41]/5 transition-all uppercase tracking-widest"
         >
           + Legg til i Måltidsbygger
         </button>
      </div>
    </div>
  )
}
