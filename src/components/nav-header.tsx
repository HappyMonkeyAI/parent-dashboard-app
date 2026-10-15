"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { SignOutButton } from "@/components/sign-out-button";

export function NavHeader() {
  return (
    <Suspense fallback={null}>
      <NavHeaderInner />
    </Suspense>
  );
}

function NavHeaderInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  if (status === "loading" || !session?.user) {
    return null;
  }

  const isParent = session.user.role === "parent";

  // Preserve the selected child when moving between Admin and Dashboard so the
  // parent's context isn't lost on navigation.
  const child = searchParams.get("child");
  const childQuery = child ? `?child=${encodeURIComponent(child)}` : "";

  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href={isParent ? `/admin${childQuery}` : "/dashboard"}
          className="text-base font-bold text-accent"
        >
          CheckIn Kids
        </Link>

        <div className="flex items-center gap-1">
          {isParent && (
            <>
              <Link
                href={`/dashboard${childQuery}`}
                className="rounded-sm px-3 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
              >
                Dashboard
              </Link>
              <Link
                href={`/admin${childQuery}`}
                className="rounded-sm px-3 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
              >
                Admin
              </Link>
            </>
          )}
          <NotificationBell />
          <Link
            href="/settings"
            className="rounded-sm px-3 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
          >
            Settings
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
