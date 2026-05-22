import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GramEntryForm from '@/components/forms/GramEntryForm'
import { prisma } from '@/lib/prisma'
import { fetchExternalProduct } from '@/lib/metabolism/externalSearch'

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
    // Fetch from Open Food Facts
    const code = itemId.replace('off-', '')
    foodItem = await fetchExternalProduct(code)
  } else {
    // Fetch from local DB
    foodItem = await prisma.foodItem.findUnique({
      where: { id: itemId as string },
    })
  }

  if (!foodItem) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <p>Matvaren ble ikke funnet i databasen eller på nett.</p>
        <Link href="/library" className="mt-4 text-[#00FF41] underline">Tilbake til biblioteket</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 font-sans text-white">
      <div className="w-full max-w-lg rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
        <GramEntryForm foodItem={foodItem} />
      </div>
    </div>
  )
}
