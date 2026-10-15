"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyName, displayName, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
      <div className="w-full rounded-md border border-border bg-surface p-8">
        <h1 className="text-xl font-bold text-ink">Welcome</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Set up your family account to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="familyName"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Family name
            </label>
            <input
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="The Smiths"
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Your name
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="What should we call you?"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-bold text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
              placeholder="At least 8 characters"
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
            {loading ? "Setting up..." : "Create my family"}
          </button>
        </form>
      </div>
    </main>
  );
}
