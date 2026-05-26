'use client'

import { useCockpitStore } from '@/store/cockpitStore'
import { translations, TranslationPath } from '@/lib/i18n/translations'

export function useI18n() {
  const language = useCockpitStore((state) => state.language) || 'NB'
  const t = (path: TranslationPath, variables?: Record<string, string | number>) => {
    const keys = path.split('.')
    let current: any = translations[language]

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation path not found: ${path} for language: ${language}`)
        return path
      }
      current = current[key]
    }

    if (typeof current !== 'string') {
      return path
    }

    if (variables) {
      let result = current
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, String(value))
      })
      return result
    }

    return current
  }

  return { t, language }
}
