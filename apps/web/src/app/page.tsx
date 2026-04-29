import Link from "next/link";

import { Button } from "@workspace/ui";

import { env } from "@/env";

const highlights = [
  "Next.js 16 App Router setup",
  "Biome-only linting and formatting",
  "Shared CSS loaded from @workspace/ui",
  "Environment validation via env.ts",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {env.NEXT_PUBLIC_APP_NAME}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              Shared Next.js app ready for the workspace stack.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              This app consumes the shared UI package, validates its own
              environment variables, and stays on Biome for linting instead of
              pulling in ESLint defaults.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={env.NEXT_PUBLIC_APP_URL}>Open local app URL</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="https://nextjs.org/docs">Read Next.js docs</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-muted-foreground">
            Verified environment
          </p>
          <p className="mt-2 break-all font-mono text-sm">
            {env.NEXT_PUBLIC_APP_URL}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((highlight) => (
          <article
            className="rounded-2xl border border-border/60 bg-background/80 p-5"
            key={highlight}
          >
            <p className="text-base font-medium">{highlight}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
