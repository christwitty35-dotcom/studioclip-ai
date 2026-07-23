export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <section className="max-w-4xl text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-violet-400">
          StudioClip AI
        </p>

        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Turn long videos into powerful short-form clips.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Find your strongest moments, create scroll-stopping hooks, generate
          captions, and get editing ideas in seconds.
        </p>

        <button className="mt-8 rounded-xl bg-violet-600 px-7 py-4 text-lg font-bold transition hover:bg-violet-500">
          Analyze My Video
        </button>
      </section>
    </main>
  );
}