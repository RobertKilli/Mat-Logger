'use client'

import { useEffect, useRef } from 'react'
import { useCockpitStore } from '@/store/cockpitStore'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { differenceInMinutes } from 'date-fns'

export default function NotificationEngine() {
  const { nextMealTime, glycogenLevel, cnsFatigue } = useCockpitStore()
  const { permission } = usePushNotifications()
  
  // Keep track of what we've already notified about to avoid spam
  const lastNotifiedMeal = useRef<string | null>(null)
  const lastNotifiedCNS = useRef<number>(0)

  useEffect(() => {
    if (permission !== 'granted') return

    const checkInterval = setInterval(() => {
      const now = new Date()

      // 1. Meal Check (Tactical Refueling)
      if (nextMealTime && nextMealTime !== lastNotifiedMeal.current) {
        const nextTime = new Date(nextMealTime)
        const diff = differenceInMinutes(nextTime, now)

        if (diff <= 0) {
          sendNotification('MISSION_ALERT: Tactical Refueling', {
            body: 'Refueling window is OPEN. Amino acid levels dropping. Priority: PROTEIN intake required.',
            tag: 'meal-alert'
          })
          lastNotifiedMeal.current = nextMealTime
        }
      }

      // 2. CNS Fatigue Check
      if (cnsFatigue > 80 && Math.abs(cnsFatigue - lastNotifiedCNS.current) > 5) {
        sendNotification('SYSTEM_WARNING: High CNS Load', {
          body: `Neuromuscular strain at ${Math.round(cnsFatigue)}%. Operational capacity compromised. Avoid heavy mechanical loading.`,
          tag: 'cns-alert'
        })
        lastNotifiedCNS.current = cnsFatigue
      }

      // 3. Glycogen Depletion Check
      if (glycogenLevel < 20) {
         // Logic for glycogen alert could be added here
      }

    }, 60000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [nextMealTime, glycogenLevel, cnsFatigue, permission])

  function sendNotification(title: string, options: any) {
    if (!('serviceWorker' in navigator)) {
       new Notification(title, options)
       return
    }

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        icon: '/file.svg',
        badge: '/file.svg',
        vibrate: [200, 100, 200],
        ...options
      } as any)
    })
  }

  return null // Pure logic component
}
