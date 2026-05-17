'use client'

import { useState, useEffect } from 'react'
import { updateProfile } from '@/app/(dashboard)/profile/actions'
import { useCockpitStore } from '@/store/cockpitStore'

interface ProfileFormProps {
  initialData: {
    weight: number | null
    proteinGoal: number
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [weight, setWeight] = useState(initialData.weight?.toString() ?? '')
  const [proteinGoal, setProteinGoal] = useState(initialData.proteinGoal.toString())
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const setBaseline = useCockpitStore((state) => state.setBaseline)

  // Hydrate store on mount
  useEffect(() => {
    setBaseline(initialData.weight, initialData.proteinGoal)
  }, [initialData, setBaseline])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('weight', weight)
    formData.append('proteinGoal', proteinGoal)

    const result = await updateProfile(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      const numericWeight = parseFloat(weight)
      const numericProtein = parseInt(proteinGoal)
      setBaseline(numericWeight, numericProtein)
      setMessage({ type: 'success', text: 'Baseline updated successfully' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="weight" className="block text-sm font-medium text-zinc-300">
            Body Weight (kg)
          </label>
          <div className="relative">
            <input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="block w-full rounded-lg border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-2xl font-bold text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41]"
              placeholder="0.0"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-zinc-500">
              KG
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="proteinGoal" className="block text-sm font-medium text-zinc-300">
            Daily Protein Goal (g)
          </label>
          <div className="relative">
            <input
              id="proteinGoal"
              type="number"
              value={proteinGoal}
              onChange={(e) => setProteinGoal(e.target.value)}
              className="block w-full rounded-lg border-0 bg-white/5 py-4 pl-4 pr-12 font-mono text-2xl font-bold text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41]"
              placeholder="0"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-zinc-500">
              G
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 text-center text-sm font-bold ring-1 ${
            message.type === 'success'
              ? 'bg-[#00FF41]/10 text-[#00FF41] ring-[#00FF41]/20'
              : 'bg-red-500/10 text-red-500 ring-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#00FF41] py-4 text-lg font-bold text-black transition-all hover:bg-[#00FF41]/90 disabled:opacity-50"
      >
        {loading ? 'CALIBRATING...' : 'UPDATE BASELINE'}
      </button>
    </form>
  )
}
