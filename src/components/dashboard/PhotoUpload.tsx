'use client'

import { useState } from 'react'
import { uploadDailyPhoto } from '@/app/(dashboard)/progress/consistencyActions'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useI18n } from '@/hooks/useI18n'

interface PhotoUploadProps {
  onSuccess: () => void
}

export default function PhotoUpload({ onSuccess }: PhotoUploadProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!url.startsWith('http')) {
      setError('Ugyldig URL. Start med http:// eller https://')
      return
    }

    setIsUploading(true)
    setError(null)

    const res = await uploadDailyPhoto(url, notes)

    if (res.success) {
      setUrl('')
      setNotes('')
      setIsOpen(false)
      onSuccess()
    } else {
      setError(res.error || 'Feil ved lagring av bilde')
    }
    setIsUploading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="font-mono text-[8px] text-[#00FF41] uppercase border border-[#00FF41]/30 px-3 py-1 rounded-full hover:bg-[#00FF41]/10 transition-all"
      >
        {t('progress.add_photo')}
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-[#0A0A0B] p-8 ring-1 ring-white/10 shadow-2xl">
            <DialogTitle className="font-mono text-xl font-bold text-[#00FF41] uppercase tracking-tight mb-6">
              PHOTO_LOG_ENTRY
            </DialogTitle>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-500">Bilde URL (S3/Supabase/Link)</label>
                <input 
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg bg-black/40 border-0 p-3 text-xs font-mono text-white ring-1 ring-[#00FF41]/20 focus:ring-2 focus:ring-[#00FF41] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-500">Logg-notater</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="..."
                  rows={2}
                  className="w-full rounded-lg bg-black/40 border-0 p-3 text-xs font-mono text-white ring-1 ring-white/10 focus:ring-2 focus:ring-[#00FF41] outline-none resize-none"
                />
              </div>

              {error && <p className="font-mono text-[9px] text-red-500 uppercase">{error}</p>}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg bg-white/5 py-3 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !url}
                  className="flex-1 rounded-lg bg-[#00FF41] py-3 text-xs font-bold text-black hover:bg-[#00FF41]/90 disabled:opacity-30 transition-all uppercase"
                >
                  {isUploading ? 'SYNCHRONIZING...' : 'BEKREFT_BILDE'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
