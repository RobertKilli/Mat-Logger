import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GramEntryForm from '@/components/forms/GramEntryForm'
import { prisma } from '@/lib/prisma'
import { fetchExternalProduct } from '@/lib/metabolism/externalSearch'
import Link from 'next/link'

export default async function QuickLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { item: itemId } = await searchParams

  if (!itemId) {
    redirect('/library')
  }

  let foodItem: any = null

  if (typeof itemId === 'string' && itemId.startsWith('off-')) {
    const code = itemId.replace('off-', '')
    foodItem = await fetchExternalProduct(code)
  } else {
    foodItem = await prisma.foodItem.findUnique({
      where: { id: itemId as string },
    })
  }

  if (!foodItem) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <p>Matvaren ble ikke funnet i databasen eller på nett.</p>
        <Link href="/library" className="mt-4 text-[#00FF41] underline font-mono text-xs">TILBAKE TIL BIBLIOTEKET</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 font-sans text-white">
      <div className="w-full max-w-lg space-y-6">
        <Link 
          href="/library" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all ring-1 ring-white/10 font-mono text-[10px] text-zinc-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          RETUR_TIL_BIBLIOTEK
        </Link>
        
        <div className="rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
          <GramEntryForm foodItem={foodItem} onSuccess={() => redirect('/')} />
        </div>
      </div>
    </div>
  )
}
