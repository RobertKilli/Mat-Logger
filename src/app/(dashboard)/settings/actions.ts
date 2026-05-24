'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUserSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      display_name: true,
      theme_color: true,
    }
  })

  return { data: dbUser }
}

export async function updateSettings(data: { display_name: string, theme_color: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        display_name: data.display_name,
        theme_color: data.theme_color,
      }
    })

    revalidatePath('/')
    revalidatePath('/settings')
    return { success: true }
  } catch (e) {
    console.error('Update settings error:', e)
    return { error: 'Failed to update cockpit configuration' }
  }
}
