"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const redirectParam = searchParams.get("redirect");
    if (redirectParam && redirectParam !== "/") {
      window.location.href = redirectParam;
      return;
    }

    try {
      const res = await fetch("/api/auth/session");
      const sessionData = await res.json();
      const role = sessionData?.user?.role;
      window.location.href = role === "parent" ? "/admin" : "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
      <div className="w-full rounded-md border border-border bg-surface p-8">
        <h1 className="text-xl font-bold text-ink">Log in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="rounded-md bg-error-bg p-3 text-sm font-bold text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-accent px-6 py-3 text-base font-bold text-ink-inverse transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
