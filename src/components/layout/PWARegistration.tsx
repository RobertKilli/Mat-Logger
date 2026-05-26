'use client'

import { useEffect } from 'react'

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('BODY_COCKPIT_OS: ServiceWorker operative.', registration.scope)
          })
          .catch((err) => {
            console.warn('BODY_COCKPIT_OS: ServiceWorker failure.', err)
          })
      })
    }
  }, [])

  return null
}
