'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
        formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E
        ]
      },
      /* verbose= */ false
    )

    scanner.render(
      (decodedText) => {
        // Success
        scanner.clear().then(() => {
          onScan(decodedText)
        })
      },
      (errorMessage) => {
        // We don't want to show every frame error, but maybe log it
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err))
      }
    }
  }, [onScan])

  return (
    <div className="space-y-4">
      <div id="barcode-reader" className="overflow-hidden rounded-xl bg-black ring-1 ring-white/10" />
      
      <div className="flex flex-col items-center gap-2">
         <p className="font-mono text-[10px] text-zinc-500 uppercase animate-pulse">
           Søker etter strekkode...
         </p>
         <button
            onClick={onClose}
            className="mt-4 rounded-xl bg-white/5 px-8 py-3 font-mono text-xs font-bold text-white hover:bg-white/10 transition-all"
         >
            AVBRYT SKANNING
         </button>
      </div>

      {error && (
        <p className="text-center font-mono text-xs text-red-500 uppercase">{error}</p>
      )}
    </div>
  )
}
