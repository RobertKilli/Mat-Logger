import FoodSearch from '@/components/dashboard/FoodSearch'

export default function LibraryPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
              FOOD LIBRARY
            </h1>
            <p className="text-zinc-400">Select a fuel source to log</p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-full bg-white/5 px-4 py-2 font-mono text-[10px] text-zinc-500 ring-1 ring-white/10">
              SYSTEM READY
            </div>
          </div>
        </header>

        <FoodSearch />
      </div>
    </div>
  )
}
