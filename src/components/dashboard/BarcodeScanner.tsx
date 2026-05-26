'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { fetchProductByBarcode } from '@/app/(dashboard)/library/scannerActions'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/hooks/useI18n'

interface BarcodeScannerProps {
  onClose: () => void
  onScan?: (code: string) => void
}

export default function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      },
      /* verbose= */ false
    )

    scanner.render(onScanSuccess, onScanError)
    scannerRef.current = scanner

    async function onScanSuccess(decodedText: string) {
      if (isProcessing) return
      
      setIsProcessing(true)
      
      if (onScan) {
        onScan(decodedText)
        return
      }

      scanner.pause(true) // Pause scanning while processing

      const res = await fetchProductByBarcode(decodedText)

      if (res.data) {
        // Redirect to quick-log for the found/created item
        router.push(`/quick-log?item=${res.data.id}`)
        onClose()
      } else {
        setError(res.error || t('common.error'))
        setIsProcessing(false)
        scanner.resume()
      }
    }

    function onScanError(err: any) {
      // Quietly ignore scan errors
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error('Scanner cleanup error', e))
      }
    }
  }, [onClose, isProcessing, router, onScan, t])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest">{t('library.scanner_title')}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10">
        <div id="barcode-reader" className="w-full"></div>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-4">
           <div className="h-2 w-2 animate-bounce rounded-full bg-[#00FF41]"></div>
           <div className="h-2 w-2 animate-bounce rounded-full bg-[#00FF41] [animation-delay:-.3s]"></div>
           <div className="h-2 w-2 animate-bounce rounded-full bg-[#00FF41] [animation-delay:-.5s]"></div>
           <span className="font-mono text-[10px] text-[#00FF41] uppercase ml-2">{t('library.analyzing_bio')}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[9px] uppercase text-center">
          ⚠️ {error}
        </div>
      )}

      <p className="text-center font-mono text-[8px] text-zinc-600 uppercase tracking-tighter">
        {t('library.scanner_desc')}
      </p>
    </div>
  )
}
