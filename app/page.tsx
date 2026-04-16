export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center gap-12 py-32 px-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Mo-Tek Solutions
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Professional technology services built for modern businesses.
            Reliable, scalable, and tailored to your needs.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="mailto:contact@mo-tek.com"
            className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Contact Us
          </a>
          <a
            href="#services"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
          >
            Our Services
          </a>
        </div>
      </main>
    </div>
  );
}
