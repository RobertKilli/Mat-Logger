'use client'

import { useRouter } from 'next/navigation'
import GramEntryForm from './GramEntryForm'
import { BaseUnit } from '@prisma/client'

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

  return (
    <GramEntryForm 
      foodItem={foodItem} 
      onSuccess={() => router.push('/')} 
    />
  )
}
