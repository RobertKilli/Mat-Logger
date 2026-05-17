import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/forms/ProfileForm'
import { prisma } from '@/lib/prisma'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
            PILOT BASELINE
          </h1>
          <p className="text-zinc-400">Configure your physiological parameters</p>
        </header>

        <div className="rounded-2xl bg-[#141416] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
          <ProfileForm
            initialData={{
              weight: dbUser?.weight ?? null,
              proteinGoal: dbUser?.protein_goal ?? 0,
            }}
          />
        </div>
      </div>
    </div>
  )
}
