import GDPRTools from '@/components/dashboard/GDPRTools'

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
            PRIVACY & DATA
          </h1>
          <p className="text-zinc-400">Manage your pilot data and account rights</p>
        </header>

        <div className="rounded-2xl bg-[#141416] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
          <GDPRTools />
        </div>
      </div>
    </div>
  )
}
