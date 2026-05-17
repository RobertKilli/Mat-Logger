import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      // Include all relations here as they are added (food logs, workout logs)
    })

    const exportData = {
      timestamp: new Date().toISOString(),
      pilot_profile: userData,
      logs: {
        food: [], // Placeholder for future epics
        training: [], // Placeholder for future epics
      },
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mat-logger-export-${user.id}.json"`,
      },
    })
  } catch (e) {
    console.error('Export error:', e)
    return new NextResponse('Export failed', { status: 500 })
  }
}
