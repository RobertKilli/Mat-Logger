import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { searchExternalFood } from '@/lib/metabolism/externalSearch'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] })
  }

  try {
    const results = await searchExternalFood(query)
    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('API search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
