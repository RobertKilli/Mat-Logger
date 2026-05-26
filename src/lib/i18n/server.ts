import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { translations, LanguageCode } from './translations'

export async function getI18nServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let lang: LanguageCode = 'NB'

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { language: true }
    })
    if (dbUser?.language) {
      lang = dbUser.language as LanguageCode
    }
  }

  const t = (path: string) => {
    const keys = path.split('.')
    let current: any = translations[lang]
    
    for (const key of keys) {
      if (!current || current[key] === undefined) return path
      current = current[key]
    }
    
    return current
  }

  return { t, lang }
}
