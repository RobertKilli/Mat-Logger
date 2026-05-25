import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/forms/SettingsForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      display_name: true,
      theme_color: true,
      weight: true,
      calorie_goal: true,
      goal: true,
      language: true,
    }
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-12">
        <header className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
            title="Tilbake til dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              SYSTEM_SETTINGS
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">Cockpit UI & Personalization</p>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Brukergrensesnitt</h2>
          <div className="rounded-2xl bg-[#141416] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
            <SettingsForm
              initialData={{
                display_name: dbUser?.display_name ?? null,
                theme_color: dbUser?.theme_color ?? null,
                calorie_goal: dbUser?.calorie_goal ?? 2500,
                goal: dbUser?.goal ?? 'MAINTAIN',
                weight: dbUser?.weight ?? null,
                language: dbUser?.language ?? 'NB',
              }}
            />
          </div>
        </section>

        <section className="pt-12 border-t border-white/5">
           <p className="font-mono text-[8px] text-zinc-700 uppercase text-center tracking-widest">
             Endringer lagres globalt i ditt operasjonssenter.
           </p>
        </section>
      </div>
    </div>
  )
}
