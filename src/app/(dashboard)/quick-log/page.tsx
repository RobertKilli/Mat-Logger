import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GramEntryForm from '@/components/forms/GramEntryForm'
import { prisma } from '@/lib/prisma'

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
    const firstItem = await prisma.foodItem.findFirst()
    
    if (!firstItem) {
      return (
        <div className="flex items-center justify-center p-12 text-zinc-500">
          <p>No food items found in cockpit database. Please seed library first.</p>
        </div>
      )
    }

    redirect(`/quick-log?item=${firstItem.id}`)
  }

  const foodItem = await prisma.foodItem.findUnique({
    where: { id: itemId as string },
  })

  if (!foodItem) {
    return <div className="p-12 text-center">Item not found</div>
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 font-sans text-white">
      <div className="w-full max-w-lg rounded-3xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10 sm:p-12">
        <GramEntryForm foodItem={foodItem} />
      </div>
    </div>
  )
}
