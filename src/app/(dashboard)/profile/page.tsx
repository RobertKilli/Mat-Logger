import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/forms/ProfileForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
        <header className="mb-8 flex items-center gap-4">
          <Link 
            href="/" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
            title="Tilbake til dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              PILOT BASELINE
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Physiological parameter configuration</p>
          </div>
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
