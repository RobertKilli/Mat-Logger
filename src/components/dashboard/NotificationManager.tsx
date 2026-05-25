'use client'

import { useEffect, useState } from 'react'

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          function(err) {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const res = await Notification.requestPermission()
    setPermission(res)
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/20">
        <div className="h-1.5 w-1.5 rounded-full bg-[#00FF41]" />
        <span className="font-mono text-[9px] font-bold text-[#00FF41] uppercase tracking-tighter">Mobilvarslinger Aktivert</span>
      </div>
    )
  }

  return (
    <button 
      onClick={requestPermission}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      <span className="font-mono text-[9px] font-bold text-blue-500 uppercase tracking-tighter group-hover:text-blue-400">Aktiver Påminnelser</span>
    </button>
  )
}
