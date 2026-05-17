'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/(dashboard)/settings/privacy/actions'

export default function GDPRTools() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleExport() {
    window.location.href = '/api/export'
  }

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteAccount()
    if (result?.error) {
      alert(result.error)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h2 className="font-mono text-xl font-bold text-white uppercase tracking-tight">
          Data Portability
        </h2>
        <p className="text-sm text-zinc-400">
          Download a complete record of your activity in a machine-readable JSON format.
        </p>
        <button
          onClick={handleExport}
          className="w-full rounded-lg bg-zinc-800 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-700 border border-white/5"
        >
          EXPORT ALL DATA (JSON)
        </button>
      </section>

      <section className="space-y-4 pt-8 border-t border-white/5">
        <h2 className="font-mono text-xl font-bold text-red-500 uppercase tracking-tight">
          Danger Zone
        </h2>
        <p className="text-sm text-zinc-400">
          Permanently erase your pilot profile and all associated logs. This action cannot be undone.
        </p>
        
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full rounded-lg bg-red-500/10 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 border border-red-500/20"
          >
            DELETE ACCOUNT
          </button>
        ) : (
          <div className="space-y-4 rounded-xl bg-red-500/5 p-4 border border-red-500/20">
            <p className="text-sm font-bold text-red-500 text-center">
              ARE YOU ABSOLUTELY SURE?
            </p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg bg-zinc-800 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-700"
              >
                CANCEL
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white transition-all hover:bg-red-700"
              >
                {isDeleting ? 'PURGING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
