"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  async function handleSignOut() {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager?.getSubscription();
        if (subscription) {
          const response = await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
          if (response.ok) await subscription.unsubscribe();
        }
      }
    } catch {
      // Signing out must remain available if the browser's push API is unavailable.
    }
    await signOut({ redirect: false });
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-sm px-3 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
    >
      Sign out
    </button>
  );
}
