"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ChildItem {
  id: string;
  familyId: string;
  userId: string | null;
  displayName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  consentGivenAt: Date;
  consentGivenBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
}

export function ChildList({ items }: { items: ChildItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  function startEditing(child: ChildItem) {
    setEditingId(child.id);
    setName(child.displayName);
    setEmail(child.email || "");
    setDob(child.dateOfBirth || "");
    setPassword("");
    setError(null);
    setSuccessId(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setError(null);
  }

  async function handleSave(childId: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/children/${childId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        dateOfBirth: dob || null,
        password: password || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update child details.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setEditingId(null);
    setSuccessId(childId);
    router.refresh();

    // Auto clear success indicator after 3 seconds
    setTimeout(() => {
      setSuccessId(null);
    }, 3000);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      {items.map((child) => {
        const isEditing = editingId === child.id;
        const isSuccess = successId === child.id;

        return (
          <div
            key={child.id}
            className="rounded-md border border-border bg-surface p-5 transition-colors duration-150"
          >
            {!isEditing ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-ink">
                      {child.displayName}
                    </p>
                    <span className="rounded-full bg-done-bg px-2.5 py-0.5 text-xs font-bold text-done">
                      Active
                    </span>
                  </div>

                  {child.email && (
                    <p className="mt-1 text-sm text-ink-muted">
                      📧 {child.email}
                    </p>
                  )}

                  {child.dateOfBirth && (
                    <p className="mt-1 text-sm text-ink-muted">
                      🎂 Born{" "}
                      {new Date(child.dateOfBirth + "T00:00:00").toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-ink-muted">
                    Consent given{" "}
                    {new Date(child.consentGivenAt).toLocaleDateString("en-GB")}
                  </p>

                  {isSuccess && (
                    <p className="mt-2 text-xs font-bold text-done">
                      ✓ Details saved successfully
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => startEditing(child)}
                  className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-surface-raised hover:text-accent-hover"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(child.id);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-base font-bold text-ink">
                    Edit {child.displayName}&apos;s details
                  </h3>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="text-xs font-bold text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`edit-name-${child.id}`}
                    className="mb-1 block text-sm font-bold text-ink"
                  >
                    Child&apos;s name
                  </label>
                  <input
                    id={`edit-name-${child.id}`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-border-strong bg-surface px-4 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`edit-dob-${child.id}`}
                    className="mb-1 block text-sm font-bold text-ink"
                  >
                    Date of birth (optional)
                  </label>
                  <input
                    id={`edit-dob-${child.id}`}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-surface px-4 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`edit-email-${child.id}`}
                    className="mb-1 block text-sm font-bold text-ink"
                  >
                    Login email
                  </label>
                  <input
                    id={`edit-email-${child.id}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-border-strong bg-surface px-4 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`edit-password-${child.id}`}
                    className="mb-1 block text-sm font-bold text-ink"
                  >
                    New password (optional)
                  </label>
                  <input
                    id={`edit-password-${child.id}`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    placeholder="Leave blank to keep existing password"
                    className="w-full rounded-md border border-border-strong bg-surface px-4 py-2 text-base text-ink placeholder:text-ink-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  />
                </div>

                {error && (
                  <p className="rounded-md bg-error-bg p-3 text-sm font-bold text-error">
                    {error}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={loading}
                    className="rounded-md border border-border px-4 py-2 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-accent px-5 py-2 text-sm font-bold text-ink-inverse transition-colors hover:bg-accent-hover disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
