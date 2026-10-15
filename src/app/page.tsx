import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "parent") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">CheckIn Kids</h1>
        <p className="mt-2 text-base text-ink-muted">
          A calm, predictable daily routine dashboard.
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Link
          href="/login?redirect=/dashboard"
          className="flex items-center justify-center rounded-md bg-accent px-6 py-3 text-base font-bold text-ink-inverse transition-colors duration-150 hover:bg-accent-hover"
        >
          My Dashboard
        </Link>
        <Link
          href="/login?redirect=/admin"
          className="flex items-center justify-center rounded-md border border-border-strong bg-surface px-6 py-3 text-base font-bold text-accent transition-colors duration-150 hover:bg-accent-muted"
        >
          Parent Admin
        </Link>
      </div>

      <p className="text-sm text-ink-muted">
        Built for calm. No noise, no rush, no surprises.
      </p>
    </main>
  );
}
