'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import MealBuilder from './MealBuilder'
import { useI18n } from '@/hooks/useI18n'

export default function MealBuilderStatus() {
  const { t } = useI18n()
  const mealBuilderQueue = useCockpitStore((state) => state.mealBuilderQueue)
  const [isOpen, setIsOpen] = useState(false)

  if (mealBuilderQueue.length === 0) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[#00FF41] px-6 py-4 font-mono text-xs font-bold text-black shadow-2xl hover:scale-105 transition-all ring-4 ring-black"
      >
        <div className="relative">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
           <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-[#00FF41] ring-2 ring-[#00FF41]">
             {mealBuilderQueue.length}
           </span>
        </div>
        {t('builder.title').toUpperCase()}
      </button>
...

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-3xl bg-[#0A0A0B] p-8 ring-1 ring-white/10 shadow-2xl">
            <MealBuilder 
              onCancel={() => setIsOpen(false)} 
              onSuccess={() => {
                setIsOpen(false)
                // Maybe a toast here
              }} 
            />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
