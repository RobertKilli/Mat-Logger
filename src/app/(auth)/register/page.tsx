import { signup } from '../actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-4 font-sans text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#141416] p-8 shadow-2xl ring-1 ring-white/10">
        <div className="text-center">
          <h2 className="font-mono text-3xl font-bold tracking-tighter text-[#00FF41]">
            JOIN CREW
          </h2>
          <p className="mt-2 text-zinc-400">Initialize your pilot profile</p>
        </div>

        <form className="mt-8 space-y-6" action={signup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41] sm:text-sm"
                placeholder="pilot@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#00FF41] sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 ring-1 ring-red-500/20">
              {error as string}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-[#00FF41] px-4 py-3 text-sm font-bold text-black transition-all hover:bg-[#00FF41]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF41]"
            >
              INITIALIZE PROFILE
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already a pilot?{' '}
          <a href="/login" className="font-bold text-[#00FF41] hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  )
}
