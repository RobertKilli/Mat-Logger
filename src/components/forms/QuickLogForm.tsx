'use client'

import { useRouter } from 'next/navigation'
import GramEntryForm from './GramEntryForm'

interface QuickLogFormProps {
  foodItem: any
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
