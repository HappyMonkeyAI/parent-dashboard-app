"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  deleteNotification,
} from "@/app/api/notifications/actions";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [, startTransition] = useTransition();

  function fetchAll() {
    startTransition(async () => {
      const [count, notifs] = await Promise.all([
        getUnreadCount(),
        getNotifications(),
      ]);
      setUnread(count);
      setItems(notifs as Notification[]);
    });
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchAll();
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllRead();
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  }

  function handleDeleteNotification(id: string, isRead: boolean) {
    startTransition(async () => {
      await deleteNotification(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      if (!isRead) {
        setUnread((prev) => Math.max(0, prev - 1));
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        className="relative rounded-sm px-3 py-2 text-sm font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised hover:text-ink"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink-inverse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-ink">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-accent hover:text-accent-hover"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">
                No notifications yet.
              </p>
            ) : (
              items.map((n) => {
                const targetLink = n.link ? n.link.trim() : null;
                return (
                  <div
                    key={n.id}
                    className={`group relative flex items-start justify-between border-b border-border px-4 py-3 last:border-0 ${
                      n.isRead ? "" : "bg-accent-muted"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      {targetLink ? (
                        <Link
                          href={targetLink}
                          onClick={() => setOpen(false)}
                          className="block hover:underline"
                        >
                          <p className="text-sm font-bold text-ink">{n.title}</p>
                          {n.body && (
                            <p className="mt-0.5 text-xs text-ink-muted">{n.body}</p>
                          )}
                          <p className="mt-1 text-xs text-ink-muted">
                            {timeAgo(new Date(n.createdAt))}
                          </p>
                        </Link>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-ink">{n.title}</p>
                        {n.body && (
                          <p className="mt-0.5 text-xs text-ink-muted">{n.body}</p>
                        )}
                        <p className="mt-1 text-xs text-ink-muted">
                          {timeAgo(new Date(n.createdAt))}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteNotification(n.id, n.isRead);
                    }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-error text-white transition-opacity duration-150 hover:opacity-90"
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </button>
                </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
