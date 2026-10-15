"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddChildForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, dateOfBirth: dob || null }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setPassword("");
    setDob("");
    setLoading(false);
    router.refresh();
  }

  if (success) {
    return (
      <div className="mt-4 rounded-md bg-done-bg p-4">
        <p className="text-base font-bold text-ink">Child added</p>
        <p className="mt-1 text-sm text-ink-muted">
          They can now log in with their email and password.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-sm font-bold text-accent hover:text-accent-hover"
        >
          Add another child
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div>
        <label htmlFor="child-name" className="mb-1 block text-sm font-bold text-ink">
          Child&apos;s name
        </label>
        <input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="Their name"
        />
      </div>

      <div>
        <label htmlFor="child-dob" className="mb-1 block text-sm font-bold text-ink">
          Date of birth (optional)
        </label>
        <input
          id="child-dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
      </div>

      <div>
        <label htmlFor="child-email" className="mb-1 block text-sm font-bold text-ink">
          Login email
        </label>
        <input
          id="child-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="child@example.com"
        />
      </div>

      <div>
        <label htmlFor="child-password" className="mb-1 block text-sm font-bold text-ink">
          Login password
        </label>
        <input
          id="child-password"
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
        {loading ? "Adding..." : "Add child"}
      </button>
    </form>
  );
}
