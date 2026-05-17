'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getWorkoutHistory() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const logs = await prisma.workoutLog.findMany({
      where: { user_id: user.id },
      orderBy: { logged_at: 'desc' },
    })

    return { data: logs }
  } catch (e) {
    console.error('Error fetching history:', e)
    return { error: 'Failed to retrieve history' }
  }
}
