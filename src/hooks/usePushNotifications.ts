'use client'

import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  async function requestPermission() {
    if (!isSupported) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('BODY_COCKPIT_OS: Permission request failure.', error)
      return false
    }
  }

  return {
    permission,
    isSupported,
    requestPermission
  }
}
